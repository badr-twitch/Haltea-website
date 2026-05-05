# HALTÉA — Luxury Concierge Platform

HALTÉA is a luxury concierge web platform offering ultra-VIP services. The project is split into a static multi-page frontend and a Node.js/Express backend that powers the contact form with multi-provider email delivery.

## Project Structure

```
PayedProject/
├── haltea-frontend/        # Static client website (FR + EN)
│   ├── index.html          # Home / Accueil
│   ├── services.html       # Nos Services
│   ├── conciergerie.html   # Conciergerie
│   ├── realisations.html   # Nos Réalisations
│   ├── contact.html        # Contact form
│   ├── main.js             # Client-side logic (i18n, form submit, UI)
│   └── style.css           # Black & gold luxury theme
│
└── haltea-backend/         # Express API + static file server
    ├── server.js           # API, email pipeline, static hosting
    ├── start.js            # Startup wrapper with .env validation
    ├── package.json
    └── README.md           # Backend-specific docs
```

## Features

### Frontend
- Five-page luxury concierge site (Accueil, Services, Conciergerie, Réalisations, Contact).
- Black-and-gold design system with `Playfair Display` and `Inter` typography.
- Bilingual interface (French / English) driven by `data-translate` attributes in `main.js`.
- AJAX contact form posting to the backend `/api/contact` endpoint.

### Backend
- Express 5 server exposing a JSON API and serving the frontend statically.
- Contact form pipeline with **graceful fallbacks**:
  1. SendGrid HTTP API (primary — bypasses SMTP port blocks on cloud hosts).
  2. Gmail SMTP (STARTTLS on 587).
  3. Gmail SMTP (SSL on 465).
  4. SendGrid SMTP.
  5. Mailgun SMTP.
  6. Local file log (`failed_emails.log`) as last-resort persistence.
- Branded HTML email template (luxury black/gold) with client info, message, and request metadata.
- Server-side validation (required fields, email regex).
- CORS, JSON/urlencoded parsing with 10 MB limits.
- Health check endpoint and detailed diagnostic logging.

## API Endpoints

| Method | Path           | Description                        |
|--------|----------------|------------------------------------|
| POST   | `/api/contact` | Submit a contact-form message.     |
| GET    | `/api/health`  | Server health and uptime.          |
| GET    | `/*` (non-API) | Serves the frontend SPA fallback.  |

### `POST /api/contact`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+33123456789",
  "message": "Bonjour..."
}
```

Successful response:
```json
{
  "success": true,
  "message": "Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.",
  "messageId": "...",
  "provider": "sendgrid_http_api"
}
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- An email provider account (SendGrid recommended; Gmail App Password, or Mailgun also supported).

## Installation

```bash
cd haltea-backend
npm install
```

Create a `.env` file in `haltea-backend/`:

```env
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
RECIPIENT_EMAIL=contact@yourdomain.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
MAILGUN_USER=postmaster@your-mailgun-domain
MAILGUN_PASS=your-mailgun-password
NODE_ENV=development
```

## Running

```bash
# from haltea-backend/
npm start        # production (uses start.js wrapper)
npm run dev      # direct node server.js
```

The server listens on `http://localhost:3001` and serves the frontend from `../haltea-frontend`.

## Environment Variables

| Variable            | Required | Description                                              |
|---------------------|----------|----------------------------------------------------------|
| `PORT`              | No       | HTTP port (default `3001`).                              |
| `EMAIL_USER`        | Yes\*    | Gmail sender address.                                    |
| `EMAIL_PASS`        | Yes\*    | Gmail App Password (not your account password).          |
| `RECIPIENT_EMAIL`   | Yes      | Inbox that receives contact-form notifications.          |
| `SENDGRID_API_KEY`  | Reco.    | Enables the SendGrid HTTP API path (recommended).        |
| `MAILGUN_USER`      | No       | Mailgun SMTP username.                                   |
| `MAILGUN_PASS`      | No       | Mailgun SMTP password.                                   |
| `NODE_ENV`          | No       | `development` exposes debug error messages.              |

\* At least one working provider must be configured. SendGrid HTTP API is preferred on platforms (Render, Heroku) that block outbound SMTP.

## Email Delivery Strategy

The backend tries providers in order and short-circuits on the first success. Each SMTP attempt is wrapped in a 10-second timeout. If every provider fails, the request still returns `200 OK` to the client and the submission is appended to `failed_emails.log` for manual processing — protecting the user experience while preserving the lead.

## Deployment Notes

- **Render / Heroku / Fly.io**: Outbound SMTP (ports 25/465/587) is often blocked. Configure `SENDGRID_API_KEY` so the HTTP API path succeeds.
- **VPS (DigitalOcean, OVH, etc.)**: SMTP works directly; PM2 + Nginx reverse proxy is recommended.
- **Static-only hosting**: The frontend can be served independently from any CDN; point its contact form to the backend's public URL.

## Security

- Server-side validation on every submitted field.
- Email format validation via regex.
- Minimal logging of PII; client IP and User-Agent are recorded only inside the email body.
- No secrets are committed; configuration is `.env`-driven.

## License

This project is proprietary. **All rights reserved.** See [`LICENSE`](./LICENSE) for the full notice.

---

© HALTÉA. All rights reserved.
