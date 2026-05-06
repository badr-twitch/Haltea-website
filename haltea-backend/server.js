const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust the first proxy hop (Render, Heroku, etc.) so rate-limit reads the real client IP
app.set('trust proxy', 1);

// CORS allowlist — configurable via ALLOWED_ORIGINS env (comma-separated).
// Same-origin requests have no Origin header and are allowed.
// Production domain is included by default so the form keeps working even if the
// Render env var is unset; override with ALLOWED_ORIGINS to restrict further.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ||
    'https://halteaevents.fr,https://www.halteaevents.fr,https://haltea-server.onrender.com,http://localhost:3001')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        console.warn(`⛔ CORS blocked origin: ${origin}`);
        // Pass null + false so cors responds without CORS headers instead of
        // throwing — the browser will block the request, and direct (non-browser)
        // callers get a clean 403 from the explicit check below.
        return cb(null, false);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Explicit 403 for disallowed origins on /api/* so non-browser callers get a
// meaningful status instead of falling through to the generic 500 handler.
app.use('/api', (req, res, next) => {
    const origin = req.get('Origin');
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ success: false, message: 'Origin not allowed.' });
    }
    next();
});

// Tighter body-size limits — a contact form does not need 10 MB
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// Rate limiter for the contact endpoint: 5 submissions per 10 minutes per IP
const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Trop de requêtes envoyées. Veuillez réessayer dans quelques minutes.'
    }
});

// HTML-escape user-supplied strings before interpolating into the email template
const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../haltea-frontend')));

// Resend HTTP API email sender — only delivery path (SMTP ports are blocked
// on most cloud hosts including Render). Replaced SendGrid after hitting the
// "Maximum credits exceeded" 401 on the free tier; Resend's free tier is
// 3000/month / 100/day which is plenty for a contact form.
//
// Required env: RESEND_API_KEY
// Required env: EMAIL_USER must be on a verified domain in the Resend dashboard
//   (Domains → Add Domain → DNS records). For halteaevents.fr, point the SPF
//   and DKIM records at Resend per their setup instructions, otherwise sends
//   are rejected with "domain is not verified".
const sendEmailViaResend = (formData, mailOptions) => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            return reject(new Error('RESEND_API_KEY not configured'));
        }

        const emailData = JSON.stringify({
            from: mailOptions.from,
            to: [mailOptions.to],
            subject: mailOptions.subject,
            html: mailOptions.html,
            reply_to: formData.email
        });

        const options = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(emailData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                // Resend returns 200 with { id: "..." } on success
                if (res.statusCode === 200) {
                    let parsed = {};
                    try { parsed = JSON.parse(responseData); } catch (_) { /* non-JSON success body */ }
                    resolve({
                        messageId: parsed.id || 'resend-success',
                        response: 'Email sent successfully via Resend HTTP API',
                        statusCode: res.statusCode
                    });
                } else {
                    reject(new Error(`Resend API error: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Resend API request timeout'));
        });

        req.setTimeout(10000); // 10 second timeout
        req.write(emailData);
        req.end();
    });
};

// Email template function
const createEmailTemplate = (formData) => {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouveau message — HALTÉA</title>
</head>
<body style="margin:0;background-color:#f9f9f9;">
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: #000000; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="color: #D4AF37; text-align: center; margin-bottom: 30px; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">
                Nouveau Message - Conciergerie de Luxe
            </h2>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #D4AF37; margin-bottom: 15px; font-size: 18px;">Informations du Client</h3>
                <p style="color: white; margin: 8px 0; font-size: 16px;"><strong style="color: #D4AF37; font-weight: bold;">Nom:</strong> ${escapeHtml(formData.name)}</p>
                <p style="color: white; margin: 8px 0; font-size: 16px;"><strong style="color: #D4AF37; font-weight: bold;">Email:</strong> ${escapeHtml(formData.email)}</p>
                <p style="color: white; margin: 8px 0; font-size: 16px;"><strong style="color: #D4AF37; font-weight: bold;">Téléphone:</strong> ${escapeHtml(formData.phone || 'Non fourni')}</p>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #D4AF37; margin-bottom: 15px; font-size: 18px;">Message</h3>
                <p style="color: white; line-height: 1.6; white-space: pre-wrap; font-size: 16px; margin: 0;">${escapeHtml(formData.message)}</p>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
                <h3 style="color: #D4AF37; margin-bottom: 15px; font-size: 18px;">Détails Techniques</h3>
                <p style="color: white; margin: 5px 0; font-size: 14px;"><strong style="color: #D4AF37; font-weight: bold;">Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p style="color: white; margin: 5px 0; font-size: 14px;"><strong style="color: #D4AF37; font-weight: bold;">IP:</strong> ${escapeHtml(formData.clientIP)}</p>
                <p style="color: white; margin: 5px 0; font-size: 14px;"><strong style="color: #D4AF37; font-weight: bold;">User Agent:</strong> ${escapeHtml(formData.userAgent)}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.3);">
                <p style="color: #595959; font-size: 12px;">
                    Message envoyé depuis le site web de la Conciergerie de Luxe
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

// Contact form endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
    console.log('\n📨 Contact form submission received:');
    // NOTE: do not log full headers (contains IP, UA, cookies) — log only what we need.
    console.log('📥 Request body keys:', Object.keys(req.body || {}));

    // Honeypot — bots typically fill every text input. Real users never see this field.
    // If "website" is non-empty, silently pretend success and drop the message.
    if (req.body && typeof req.body.website === 'string' && req.body.website.trim() !== '') {
        console.log('🍯 Honeypot triggered — dropping silently. Value:', req.body.website.slice(0, 50));
        return res.status(200).json({
            success: true,
            message: 'Message reçu! Nous vous contacterons dans les plus brefs délais.'
        });
    }

    // Per-field length caps (defence in depth — body limit is already 64kb)
    const MAX_NAME = 100;
    const MAX_EMAIL = 254;
    const MAX_PHONE = 30;
    const MAX_MESSAGE = 2000;
    const tooLong = (s, max) => typeof s === 'string' && s.length > max;
    if (tooLong(req.body.name, MAX_NAME) || tooLong(req.body.email, MAX_EMAIL) ||
        tooLong(req.body.phone, MAX_PHONE) || tooLong(req.body.message, MAX_MESSAGE)) {
        return res.status(400).json({ success: false, message: 'Champ trop long.' });
    }
    // Required configuration check (logged once per request without leaking values)
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_USER || !process.env.RECIPIENT_EMAIL) {
        console.error('❌ Email configuration incomplete. Required env vars: RESEND_API_KEY, EMAIL_USER, RECIPIENT_EMAIL');
        return res.status(503).json({
            success: false,
            code: 'EMAIL_NOT_CONFIGURED',
            message: 'Le service de messagerie est temporairement indisponible. Veuillez nous écrire directement à ' + (process.env.RECIPIENT_EMAIL || 'haltea.event@gmail.com') + '.'
        });
    }

    // Extract and validate data
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Nom, email et message sont requis'
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'email invalide'
        });
    }

    const formData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : '',
        message: message.trim(),
        clientIP: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
    };

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `Nouveau Message - ${formData.name} - Conciergerie de Luxe`,
        html: createEmailTemplate(formData),
        replyTo: formData.email
    };

    try {
        console.log('🚀 Sending via Resend HTTP API...');
        const result = await sendEmailViaResend(formData, mailOptions);
        console.log(`🎉 Email sent. Message-ID: ${result.messageId}`);
        return res.status(200).json({
            success: true,
            message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
            messageId: result.messageId
        });
    } catch (error) {
        // Log the failure with the form data so the operator can see lost messages
        // in the platform's log stream (Render, Heroku, etc.).
        console.error('❌ Resend send failed:', error.message);
        console.error('📝 Lost submission payload:', JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            messagePreview: formData.message.slice(0, 200)
        }));
        // Return a real failure so the frontend can offer a retry / mailto fallback.
        return res.status(502).json({
            success: false,
            code: 'EMAIL_DELIVERY_FAILED',
            message: 'Erreur lors de l\'envoi du message. Veuillez réessayer dans quelques minutes ou nous écrire directement à ' + process.env.RECIPIENT_EMAIL + '.',
            recipient: process.env.RECIPIENT_EMAIL
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


// Serve frontend for all other routes
app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../haltea-frontend/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📧 Email configuré: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
    console.log(`🌐 Frontend accessible sur: http://localhost:${PORT}`);
});

module.exports = app;
