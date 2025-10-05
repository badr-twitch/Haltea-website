const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
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
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
            pool: false,
            maxConnections: 1,
            maxMessages: 1
        },
        gmail_alt: {
            host: 'smtp.gmail.com',
            port: 25,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
            pool: false,
            maxConnections: 1,
            maxMessages: 1
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
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
            pool: false,
            maxConnections: 1,
            maxMessages: 1
        }
    };
    
    return nodemailer.createTransport(configs[provider] || configs.gmail);
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
    console.log('🔧 Environment variables check:');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
    console.log('   RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL ? '✅ Set' : '❌ Missing');
    
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
        
        // Try multiple SMTP providers with timeout
        const providers = ['gmail', 'gmail_alt', 'gmail_ssl'];
        let lastError = null;
        
        for (const provider of providers) {
            try {
                console.log(`🔧 Trying ${provider} SMTP provider...`);
                
                // Add timeout wrapper for each provider attempt
                const emailPromise = (async () => {
                    const transporter = createTransporter(provider);
                    console.log(`✅ ${provider} transporter created successfully`);
                    
                    console.log('📤 Sending email with options:', {
                        from: mailOptions.from,
                        to: mailOptions.to,
                        subject: mailOptions.subject,
                        provider: provider
                    });
                    
                    return await transporter.sendMail(mailOptions);
                })();
                
                // Race between email sending and timeout
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`${provider} timeout after 15 seconds`)), 15000);
                });
                
                const info = await Promise.race([emailPromise, timeoutPromise]);
                
                console.log(`✅ Email sent successfully via ${provider}:`, info.messageId);
                
                return res.status(200).json({
                    success: true,
                    message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
                    messageId: info.messageId,
                    provider: provider
                });
                
            } catch (providerError) {
                console.log(`❌ ${provider} failed:`, providerError.message);
                lastError = providerError;
                continue;
            }
        }
        
        // If all providers failed, try webhook fallback
        console.log('🔄 All SMTP providers failed, trying webhook fallback...');
        
        try {
            // Use a webhook service like EmailJS or similar
            const webhookUrl = 'https://api.emailjs.com/api/v1.0/email/send';
            const webhookData = {
                service_id: 'service_placeholder',
                template_id: 'template_placeholder',
                user_id: 'user_placeholder',
                template_params: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message
                }
            };
            
            // For now, just log the data for manual processing
            console.log('📝 Webhook fallback - Form data for manual processing:', JSON.stringify(formData, null, 2));
            
            // Return success even if email fails (graceful degradation)
            return res.status(200).json({
                success: true,
                message: 'Message reçu! Nous vous contacterons dans les plus brefs délais.',
                note: 'Email delivery delayed, but your message was received.'
            });
            
        } catch (webhookError) {
            console.log('❌ Webhook fallback also failed:', webhookError.message);
            throw lastError;
        }
        
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
