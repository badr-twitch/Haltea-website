# HALTÉA Backend Server

Backend server for the HALTÉA luxury concierge website, handling contact form submissions and email notifications.

## 🚀 Features

- **Contact Form API**: Handles form submissions from the website
- **Email Integration**: Sends beautiful HTML emails using Nodemailer
- **Form Validation**: Server-side validation with proper error handling
- **CORS Support**: Configured for frontend communication
- **Security**: Input sanitization and validation
- **Responsive Design**: Serves the frontend with proper routing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gmail account (or other email service)
- App password for Gmail (recommended for security)

## ⚙️ Installation

1. **Navigate to the backend directory:**
   ```bash
   cd haltea-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure your email settings in `.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   RECIPIENT_EMAIL=contact@yourdomain.com
   PORT=3001
   ```

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in your `.env` file

### Other Email Providers

You can use other SMTP providers by modifying the transporter configuration in `server.js`:

```javascript
const transporter = nodemailer.createTransporter({
    host: 'your-smtp-host',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📁 Project Structure

```
haltea-backend/
├── server.js          # Main server file
├── start.js           # Startup script with environment checks
├── package.json       # Dependencies and scripts
├── env.example        # Environment variables template
├── .env               # Your environment variables (create this)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## 🔌 API Endpoints

### POST `/api/contact`
Handles contact form submissions.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+33123456789",
  "message": "Hello, I'm interested in your services..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.",
  "messageId": "message-id-from-email-service"
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## 🎨 Email Template

The server sends beautifully formatted HTML emails with:
- **Luxury Design**: Black and gold theme matching the website
- **Client Information**: Name, email, phone
- **Message Content**: Formatted message text
- **Technical Details**: Timestamp, IP, User Agent
- **Responsive Layout**: Looks great on all devices

## 🔒 Security Features

- **Input Validation**: All form fields are validated
- **Email Validation**: Proper email format checking
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Built-in Express protections
- **Error Handling**: Graceful error responses

## 🐛 Troubleshooting

### Common Issues

1. **"Email not configured" error:**
   - Check your `.env` file exists and has correct values
   - Verify Gmail app password is correct

2. **CORS errors:**
   - Make sure frontend is running on allowed origins
   - Check CORS configuration in server.js

3. **Form submission fails:**
   - Check browser console for errors
   - Verify server is running on correct port
   - Check network tab for API call status

### Debug Mode

Set `NODE_ENV=development` in your `.env` file for detailed error logging.

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_USER` | Your email address | `your-email@gmail.com` |
| `EMAIL_PASS` | Your email password/app password | `your-app-password` |
| `RECIPIENT_EMAIL` | Where contact forms are sent | `contact@yourdomain.com` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 🚀 Deployment

### Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git

### Vercel
1. Install Vercel CLI
2. Run `vercel` in the backend directory
3. Set environment variables in Vercel dashboard

### DigitalOcean/VPS
1. Upload files to server
2. Install Node.js and dependencies
3. Use PM2 for process management
4. Set up reverse proxy with Nginx

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs for error details
- Ensure all dependencies are installed correctly

## 📄 License

MIT License - see LICENSE file for details.

---

**HALTÉA** - Luxury Concierge Services
