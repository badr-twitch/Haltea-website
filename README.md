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
- Contact form delivery via **Resend HTTP API** (one provider, real failures surfaced
  to the client with a mailto fallback — no silent black-hole logging).
- Branded HTML email template (luxury black/gold) with client info, message, and request metadata.
- Server-side validation (required fields, email regex), per-field length caps, honeypot
  field, and per-IP rate limiting (5 submissions / 10 min).
- CORS allowlist (configurable via `ALLOWED_ORIGINS`), JSON/urlencoded parsing capped at 64 KB.
- Health check endpoint and structured diagnostic logging that never echoes secrets.

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
  "messageId": "..."
}
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- A [Resend](https://resend.com/) account with an API key and a verified sending domain.

## Installation

```bash
cd haltea-backend
npm install
```

Create a `.env` file in `haltea-backend/`:

```env
PORT=3001
EMAIL_USER=contact@yourdomain.com          # must be on a Resend-verified domain
RECIPIENT_EMAIL=inbox@yourdomain.com       # where contact-form messages are delivered
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx
ALLOWED_ORIGINS=https://yourdomain.com     # comma-separated, optional
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

| Variable            | Required | Description                                                       |
|---------------------|----------|-------------------------------------------------------------------|
| `PORT`              | No       | HTTP port (default `3001`).                                       |
| `EMAIL_USER`        | Yes      | `From:` address; must be on a Resend-verified domain.             |
| `RECIPIENT_EMAIL`   | Yes      | Inbox that receives contact-form notifications.                   |
| `RESEND_API_KEY`    | Yes      | Resend API key (`re_…`).                                          |
| `ALLOWED_ORIGINS`   | No       | Comma-separated CORS allowlist; defaults cover the production domain. |
| `NODE_ENV`          | No       | `development` exposes debug error messages.                       |

## Email Delivery Strategy

The backend POSTs to `https://api.resend.com/emails`. On `200 OK` the submission's
`message_id` is returned to the client. On any other status the failure is logged
with the lost submission's payload (so it's recoverable from the platform log
stream) and the API returns `502 EMAIL_DELIVERY_FAILED` to the client — which
surfaces a localized error banner with a `mailto:` fallback to the recipient
inbox. There is no silent on-disk queue; failures are real and visible.

## Deployment Notes

- **Render / Heroku / Fly.io**: Outbound SMTP (ports 25/465/587) is often blocked, which is why this backend uses Resend's HTTP API rather than SMTP.
- **Frontend served separately (Netlify, Vercel, CDN)**: point a `/api/*` rewrite at the backend's public URL so the form's relative `/api/contact` resolves same-origin.
- **VPS (DigitalOcean, OVH, etc.)**: works the same way; the HTTP API call is portable across hosts.

## Security

- Server-side validation on every submitted field.
- Email format validation via regex.
- Minimal logging of PII; client IP and User-Agent are recorded only inside the email body.
- No secrets are committed; configuration is `.env`-driven.

## License

This project is proprietary. **All rights reserved.** See [`LICENSE`](./LICENSE) for the full notice.

---

© HALTÉA. All rights reserved.
