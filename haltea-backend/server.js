const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../haltea-frontend')));

// Email configuration with multiple SMTP providers
const createTransporter = (provider = 'gmail') => {
    const configs = {
        gmail: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            connectionTimeout: 5000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
            pool: false,
            maxConnections: 1,
            maxMessages: 1,
            logger: false,
            debug: false
        },
        gmail_ssl: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false,
                minVersion: 'TLSv1'
            },
            connectionTimeout: 5000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
            pool: false,
            maxConnections: 1,
            maxMessages: 1,
            logger: false,
            debug: false
        },
        sendgrid: {
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY || ''
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 5000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
            pool: false
        },
        mailgun: {
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAILGUN_USER || '',
                pass: process.env.MAILGUN_PASS || ''
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 5000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
            pool: false
        }
    };
    
    return nodemailer.createTransport(configs[provider] || configs.gmail);
};

// SendGrid HTTP API email sender (bypasses SMTP blockage)
const sendEmailViaSendGrid = (formData, mailOptions) => {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.SENDGRID_API_KEY;
        
        if (!apiKey) {
            return reject(new Error('SENDGRID_API_KEY not configured'));
        }
        
        const emailData = JSON.stringify({
            personalizations: [{
                to: [{ email: mailOptions.to }],
                subject: mailOptions.subject
            }],
            from: { email: mailOptions.from },
            reply_to: { email: formData.email },
            content: [{
                type: 'text/html',
                value: mailOptions.html
            }]
        });
        
        const options = {
            hostname: 'api.sendgrid.com',
            port: 443,
            path: '/v3/mail/send',
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
                if (res.statusCode === 202) {
                    resolve({
                        messageId: res.headers['x-message-id'] || 'sendgrid-success',
                        response: 'Email sent successfully via SendGrid HTTP API',
                        statusCode: res.statusCode
                    });
                } else {
                    reject(new Error(`SendGrid API error: ${res.statusCode} - ${responseData}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('SendGrid API request timeout'));
        });
        
        req.setTimeout(10000); // 10 second timeout
        req.write(emailData);
        req.end();
    });
};

// Email template function
const createEmailTemplate = (formData) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: #000000; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="color: #D4AF37; text-align: center; margin-bottom: 30px; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">
                Nouveau Message - Conciergerie de Luxe
            </h2>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #D4AF37; margin-bottom: 15px; font-size: 18px;">Informations du Client</h3>
                <p style="color: white; margin: 8px 0; font-size: 16px;"><strong style="color: #D4AF37; font-weight: bold;">Nom:</strong> ${formData.name}</p>
                <p style="color: white; margin: 8px 0; font-size: 16px;"><strong style="color: #D4AF37; font-weight: bold;">Email:</strong> ${formData.email}</p>
                <p style="color: white; margin: 8px 0; font-size: 16px;"><strong style="color: #D4AF37; font-weight: bold;">Téléphone:</strong> ${formData.phone || 'Non fourni'}</p>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #D4AF37; margin-bottom: 15px; font-size: 18px;">Message</h3>
                <p style="color: white; line-height: 1.6; white-space: pre-wrap; font-size: 16px; margin: 0;">${formData.message}</p>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
                <h3 style="color: #D4AF37; margin-bottom: 15px; font-size: 18px;">Détails Techniques</h3>
                <p style="color: white; margin: 5px 0; font-size: 14px;"><strong style="color: #D4AF37; font-weight: bold;">Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p style="color: white; margin: 5px 0; font-size: 14px;"><strong style="color: #D4AF37; font-weight: bold;">IP:</strong> ${formData.clientIP}</p>
                <p style="color: white; margin: 5px 0; font-size: 14px;"><strong style="color: #D4AF37; font-weight: bold;">User Agent:</strong> ${formData.userAgent}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.3);">
                <p style="color: #888; font-size: 12px;">
                    Message envoyé depuis le site web de la Conciergerie de Luxe
                </p>
            </div>
        </div>
    </div>
    `;
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    console.log('\n📨 Contact form submission received:');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📥 Request headers:', req.headers);
    console.log('\n🔧 Environment variables check:');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? `✅ ${process.env.EMAIL_USER}` : '❌ Missing');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? `✅ Set (length: ${process.env.EMAIL_PASS.length})` : '❌ Missing');
    console.log('   RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? `✅ ${process.env.RECIPIENT_EMAIL}` : '❌ Missing');
    console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `✅ Set (length: ${process.env.SENDGRID_API_KEY.length})` : '❌ Not configured');
    
    // Extract and validate data first
    const { name, email, phone, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Nom, email et message sont requis'
        });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Format d\'email invalide'
        });
    }
    
    // Prepare email data (moved outside try block)
    const formData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : '',
        message: message.trim(),
        clientIP: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    try {
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: `Nouveau Message - ${formData.name} - Conciergerie de Luxe`,
            html: createEmailTemplate(formData),
            replyTo: formData.email
        };
        
        // FIRST: Try SendGrid HTTP API (bypasses SMTP blockage)
        console.log('\n🚀 TRYING SENDGRID HTTP API (BYPASS SMTP)...');
        try {
            const result = await sendEmailViaSendGrid(formData, mailOptions);
            console.log(`\n🎉 SUCCESS! Email sent via SendGrid HTTP API`);
            console.log(`📧 Status Code: ${result.statusCode}`);
            console.log(`📨 Response: ${result.response}`);
            
            return res.status(200).json({
                success: true,
                message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
                messageId: result.messageId,
                provider: 'sendgrid_http_api'
            });
        } catch (sendgridError) {
            console.log(`\n❌ SendGrid HTTP API FAILED`);
            console.log(`   Error: ${sendgridError.message}`);
        }
        
        // FALLBACK: Try SMTP providers (likely to fail due to Render.com blocking)
        console.log('\n📧 Falling back to SMTP providers...');
        const providers = ['gmail', 'gmail_ssl', 'sendgrid', 'mailgun'];
        let lastError = null;
        let successfulProvider = null;
        
        for (const provider of providers) {
            try {
                console.log(`\n🔧 Attempting ${provider} SMTP provider...`);
                console.log(`⏰ Timeout: 10 seconds`);
                
                // Add timeout wrapper for each provider attempt
                const emailPromise = (async () => {
                    const transporter = createTransporter(provider);
                    console.log(`✅ ${provider} transporter created`);
                    
                    // Verify transporter configuration
                    console.log(`🔍 Verifying ${provider} connection...`);
                    await transporter.verify();
                    console.log(`✅ ${provider} connection verified`);
                    
                    console.log(`📤 Sending email via ${provider}...`);
                    const result = await transporter.sendMail(mailOptions);
                    console.log(`✅ ${provider} send completed`);
                    
                    return result;
                })();
                
                // Race between email sending and timeout (10 seconds)
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`${provider} timeout after 10 seconds`)), 10000);
                });
                
                const info = await Promise.race([emailPromise, timeoutPromise]);
                
                console.log(`\n🎉 SUCCESS! Email sent via ${provider}`);
                console.log(`📧 Message ID: ${info.messageId}`);
                console.log(`📨 Response: ${info.response}`);
                
                successfulProvider = provider;
                
                return res.status(200).json({
                    success: true,
                    message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
                    messageId: info.messageId,
                    provider: provider
                });
                
            } catch (providerError) {
                console.log(`\n❌ ${provider} FAILED`);
                console.log(`   Error: ${providerError.message}`);
                console.log(`   Code: ${providerError.code || 'N/A'}`);
                console.log(`   Command: ${providerError.command || 'N/A'}`);
                console.log(`   Response: ${providerError.response || 'N/A'}`);
                console.log(`   ResponseCode: ${providerError.responseCode || 'N/A'}`);
                
                // Gmail-specific diagnostics
                if (provider.includes('gmail')) {
                    console.log('\n🔍 Gmail Diagnostics:');
                    if (providerError.code === 'ETIMEDOUT') {
                        console.log('   ⚠️  Network timeout - Cannot reach Gmail SMTP servers');
                        console.log('   💡 Possible causes:');
                        console.log('      1. Firewall blocking outgoing SMTP connections');
                        console.log('      2. Network routing issues');
                        console.log('      3. ISP blocking SMTP ports');
                    } else if (providerError.code === 'EAUTH' || providerError.responseCode === 535) {
                        console.log('   ⚠️  Authentication failed');
                        console.log('   💡 Check:');
                        console.log('      1. Using App Password (not regular password)?');
                        console.log('      2. 2FA enabled on Gmail account?');
                        console.log('      3. App Password not expired/revoked?');
                        console.log('      4. "Less secure app access" disabled (use App Password)?');
                    } else if (providerError.code === 'ECONNECTION') {
                        console.log('   ⚠️  Connection refused');
                        console.log('   💡 Gmail SMTP might be temporarily unavailable');
                    }
                }
                
                lastError = providerError;
                continue;
            }
        }
        
        // If all providers failed, log detailed error info
        console.log('\n⚠️  ALL SMTP PROVIDERS FAILED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 FORM DATA FOR MANUAL PROCESSING:');
        console.log(JSON.stringify(formData, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Last Error:', lastError.message);
        console.log('⚠️  Error Code:', lastError.code);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Save to file as fallback
        const failedEmailsPath = path.join(__dirname, 'failed_emails.log');
        const logEntry = `\n[${new Date().toISOString()}] FAILED EMAIL\n${JSON.stringify(formData, null, 2)}\nError: ${lastError.message}\n${'='.repeat(80)}\n`;
        
        try {
            fs.appendFileSync(failedEmailsPath, logEntry);
            console.log('✅ Failed email logged to file: failed_emails.log');
        } catch (fsError) {
            console.log('❌ Could not write to log file:', fsError.message);
        }
        
        // Return success to user (graceful degradation)
        return res.status(200).json({
            success: true,
            message: 'Message reçu! Nous vous contacterons dans les plus brefs délais.',
            note: 'Your message has been received and logged for manual processing.'
        });
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            errno: error.errno,
            syscall: error.syscall,
            message: error.message,
            stack: error.stack
        });
        
        // Log the form data for manual processing if email fails
        console.log('📝 Form data received (for manual processing):', JSON.stringify(formData, null, 2));
        
        // Return appropriate error response
        const errorMessage = error.message || 'Erreur interne du serveur';
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.',
            debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
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
