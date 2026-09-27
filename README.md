# E-Sell Namibia

Namibia's buying and selling platform — a Next.js (App Router) + TypeScript + Prisma/PostgreSQL marketplace where **only E-Sell administrators publish products**. Customers submit **Sell Requests**; E-Sell reviews them and, if accepted, converts them into full marketplace listings.

A static HTML/CSS/JS design preview of the public site lives in [`preview/`](./preview) (open `preview/index.html` or run `node preview/server.js`) — it was an early visual reference and is not part of the Next.js app.

## Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5) — credentials login, JWT sessions, `USER` / `ADMIN` roles
- Vercel Blob for product/sell-request/team/banner images
- Zod validation, React Hook Form

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DATABASE_URL` — a PostgreSQL connection string
   - `AUTH_SECRET` — generate with `npx auth secret`
   - `BLOB_READ_WRITE_TOKEN` — from a Vercel Blob store (needed for image uploads)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` — the only administrator login (password at least 12 characters). It is checked straight from env at `/admin/login`, never stored in the database, and cannot be reset from the website (forgot-password and profile password changes are refused for admins). Change it by editing `.env` and restarting the server.
   - `SEED_CUSTOMER_EMAIL` and `SEED_CUSTOMER_PASSWORD` — optional demo customer credentials
   - `NEXT_PUBLIC_ESELL_WHATSAPP_NUMBER` / `NEXT_PUBLIC_ESELL_PHONE_NUMBER` / `NEXT_PUBLIC_ESELL_EMAIL` — optional seed defaults for the site's contact settings (can also be set later from `/admin/settings`)
3. **Set up the database**
   ```bash
   npm run db:push     # creates tables from prisma/schema.prisma
   npm run db:seed     # seeds categories, sample products, team members, and demo accounts
   ```
4. **Run the app**
   ```bash
   npm run dev
   ```

### Seeded accounts

The seed script creates the admin account from credentials in your local `.env`. It creates a demo customer only when both optional customer variables are set. No default passwords are included in the repository.

## Key routes

- `/` — homepage (featured products, new arrivals, categories, trust section)
- `/shop` — marketplace with search, filters, sorting
- `/products/[slug]` — product detail page
- `/sell` — multi-step "Sell Your Goods" request form
- `/about`, `/contact` — company info, team, contact form
- `/account/*` — customer dashboard (sell requests, favorites, profile) — requires login
- `/admin/login` — admin sign-in (separate from customer login)
- `/admin/*` — protected admin dashboard (products, sell requests, categories, banners, team, customers, settings) — requires an `ADMIN` role, enforced both in `middleware.ts` and server-side in each layout/action

## Business model (why there's no "Post Ad" button)

Customers never publish directly. The flow is:

```
Customer → Sell Your Goods → Sell Request (private, DB only)
Admin     → Review → Convert to Product → set final price/photos/details → Publish
```

See `app/actions/sell-requests.ts` (customer submission) and `app/actions/admin/products.ts` (`createProductAction` with `sourceSellRequestId`, which also marks the originating Sell Request as `CONVERTED`).

## Scripts

- `npm run dev` / `build` / `start`
- `npm run lint` / `npm run typecheck`
- `npm run db:push`, `db:migrate`, `db:seed`, `db:generate`

## Email (SMTP)

All email goes out over SMTP with [nodemailer](https://nodemailer.com) (`lib/email/client.ts`):

- **Sign-up verification (OTP)** — registering is a two-step flow. The form emails a 6-digit code; the account is only created once the code is entered. Codes expire after 10 minutes, allow 5 attempts and can be resent every 60 seconds. Pending sign-ups live in the `PendingRegistration` table.
- **New product alerts** — when an admin publishes a product for the first time (creating it as published, or toggling a draft to published), every customer with `receiveProductAlerts` enabled gets an email with the photo, name, price and a link. Sending runs after the admin's response, so saving a product is never slowed down. Customers can opt out from `/account/profile` or via the unsubscribe link in the email (`/unsubscribe?token=...`).
- Password reset links and order confirmations.

Setup: fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `EMAIL_FROM` in `.env` (see `.env.example`; for Gmail use `smtp.gmail.com`, port 465 and an App Password).

Without SMTP configured, emails are printed to the server console instead — including sign-up codes, so registration still works locally. In production, registration refuses to continue if the code can't be sent.

## Notes / things to wire up before production

- **Email** needs SMTP credentials (see above and `.env.example`). Without them, emails are only logged to the console.
- **Rate limiting** for auth and upload routes is not implemented; add it at the edge (e.g. Vercel Firewall / Upstash) before production traffic.
- Contact details (WhatsApp/phone/email/address) are blank until an admin fills them in at `/admin/settings` — the public "Contact E-Sell" buttons stay disabled/hidden until then, by design (no placeholder numbers are shipped).
