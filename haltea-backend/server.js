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

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // You can change this to other services
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
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
    
    try {
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
        
        // Prepare email data
        const formData = {
            name: name.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            message: message.trim(),
            clientIP: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown'
        };
        
        // Create transporter
        const transporter = createTransporter();
        
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: `Nouveau Message - ${formData.name} - Conciergerie de Luxe`,
            html: createEmailTemplate(formData),
            replyTo: formData.email
        };
        
        // Send email
        console.log('📤 Sending email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully:', info.messageId);
        
        res.status(200).json({
            success: true,
            message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('Error sending email:', error);
        
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.'
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
