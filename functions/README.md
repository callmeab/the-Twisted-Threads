# Cloud Functions — The Twisted Threads

## Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onOrderCreated` | Firestore `orders/{orderId}` onCreate | Sends order confirmation email to customer |
| `trackOrder` | HTTPS Callable | Lets customers look up orders by order number + email |

## Email setup (required for production)

Set these environment variables on your Firebase project:

```bash
firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
firebase functions:secrets:set SMTP_FROM
```

Or use `.env` with the Firebase emulator. Supported providers include Gmail (App Password), SendGrid SMTP, Mailgun, and any standard SMTP server.

Optional:

- `STORE_NAME` — defaults to "The Twisted Threads"
- `SUPPORT_EMAIL` — defaults to concierge@thetwistedthreads.com
- `SMTP_SECURE` — set to `true` for port 465

## Deploy

```bash
cd functions && npm install && npm run build
cd .. && firebase deploy --only functions,firestore:rules,storage
```
