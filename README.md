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
   - `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` — your own local admin credentials (password at least 12 characters) before running `db:seed`
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

## Notes / things to wire up before production

- **Transactional email** is not configured. Password reset links are logged to the server console (`app/actions/password-reset.ts`) — wire up a real provider (e.g. Resend) before shipping.
- **Rate limiting** for auth and upload routes is not implemented; add it at the edge (e.g. Vercel Firewall / Upstash) before production traffic.
- Contact details (WhatsApp/phone/email/address) are blank until an admin fills them in at `/admin/settings` — the public "Contact E-Sell" buttons stay disabled/hidden until then, by design (no placeholder numbers are shipped).
