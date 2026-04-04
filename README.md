# Karlmaxx Investment Limited — eCommerce

Luxury menswear storefront built with **Next.js (App Router)**, **TypeScript (strict)**, **CSS Modules**, **Supabase** (Auth, Postgres, Storage), and **Paystack**.

## Features

- Email/password and Google authentication; guest checkout supported
- Product catalog (`products` table), product detail pages, featured flags
- Cart with **React Context** + **localStorage** persistence and cart drawer
- Checkout: **Paystack** (verify via `/api/paystack/verify`) or **WhatsApp** handoff
- Paid orders in `orders` (status `paid`); totals validated server-side; stock decremented via service role
- **Admin** at `/admin`: full operations console (overview KPIs, catalog with filters & duplicate, orders with CSV export and status updates, customer roles, system checklist) — `profiles.role = 'admin'`

## Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project
- Paystack account (test or live keys)

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Supabase database** — open the [SQL Editor](https://supabase.com/dashboard) for your project and run the migration scripts in order, especially [`001_initial.sql`](supabase/migrations/001_initial.sql) (schema, RLS, storage, auth profile trigger). Later files adjust prices, images, etc.

   The migration uses `execute procedure` for the auth trigger; if Supabase SQL errors on that line, switch it to `execute function` instead.

   For the **admin dashboard** (customers list, order status edits from `/admin`), also run [`006_admin_dashboard_rls.sql`](supabase/migrations/006_admin_dashboard_rls.sql) so admins can `SELECT` all `profiles` and `UPDATE` `orders` / `profiles` as needed.

3. **Environment variables** — copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` — `service_role` key (server only; never commit or expose)

4. **Authentication (Supabase Dashboard)**

   **Providers** (Authentication → Providers)

   - **Email**: turn **on**. Required for email/password sign-in and sign-up on `/login` and `/signup`.
   - **Google**: turn **on** only if you use “Continue with Google”. In [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 credentials (Web application), add authorized redirect URIs that match what Supabase shows, then paste the **client ID** and **client secret** into the Google provider in Supabase.

   **URL configuration** (Authentication → URL configuration)

   - **Site URL**: `http://localhost:3000` while developing; your real site URL in production (e.g. `https://your-domain.com`).
   - **Redirect URLs** (add both while you use local + hosted):

     - `http://localhost:3000/auth/callback`
     - `https://<your-production-domain>/auth/callback`

   The app exchanges the OAuth code at [`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts); if these URLs are missing, Google sign-in or email links can fail or drop the session.

   **Local testing tip**

   - Under the **Email** provider, you can disable **email confirmations** so new users get a session immediately after sign-up (re-enable for production if you want confirmed emails).

5. **Admin user** — in Table Editor → `profiles`, set `role` to `admin` for your user’s row (`id` = auth user UUID).

6. **Paystack** — `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` (same mode: test or live).

7. **WhatsApp** — `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only, e.g. `2348012345678`).

8. **Images** — `next.config.ts` allows `*.supabase.co` storage URLs. If you use a custom domain, extend `remotePatterns`.

## Run & build

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the dev server after changing `.env.local`.

```bash
npm run build
npm start
```

### Continuous integration (GitHub Actions)

On every push to `main` or `staging`, and on pull requests targeting those branches, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm ci`, `npm run lint`, and `npm run build`. The workflow sets **placeholder** Supabase/Paystack env vars so the app compiles in CI without your secrets; Vercel still uses the real variables from the dashboard.

## Client preview (GitHub + Vercel)

Use this when someone (e.g. a client) needs to open the site on their own phone or laptop—not `localhost` on your machine.

### 1. Connect the repo to Vercel

In [Vercel](https://vercel.com): **Add New… → Project** → import the **GitHub** repo. Framework **Next.js** is usually auto-detected. Set **Root directory** only if the app is not at the repo root (monorepo).

Enable Git integration so **pushes to the default branch** deploy **Production**, and **pull requests** get **Preview** deployments with their own URLs.

### 2. Environment variables on Vercel

**Project → Settings → Environment Variables** — add the same names as `.env.example` / `.env.local`. Apply them to **Production** and **Preview** (and **Development** if you use `vercel dev`):

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable or legacy anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — Paystack verify, server writes |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Use **test** keys for client review if you prefer |
| `PAYSTACK_SECRET_KEY` | Match test/live with the public key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional |

**Redeploy** after changing variables (Deployments → … → Redeploy).

### 3. Supabase Auth must allow your public URLs

**Supabase Dashboard → Authentication → URL configuration**

- **Site URL**: your canonical production URL (e.g. `https://your-domain.com`), or your main Vercel production URL (e.g. `https://your-project.vercel.app`).
- **Redirect URLs**: every origin that should complete OAuth / magic links, each with **`/auth/callback`**, for example:

  - `http://localhost:3000/auth/callback` (local dev)
  - `https://your-production-domain.com/auth/callback`
  - `https://your-project.vercel.app/auth/callback`

**Preview URLs:** each Vercel PR preview has a different `*.vercel.app` host. Supabase does not reliably support one wildcard for all of them. Common approaches:

- **A — One-off review:** copy the preview URL from Vercel and add **`https://<that-preview-host>/auth/callback`** to Redirect URLs for the duration of the review.
- **B — Ongoing client reviews:** use a **fixed staging** deployment (e.g. branch `staging` → always `https://karlmaxx-staging.vercel.app`) and keep that single callback (plus production) in Supabase—less churn than updating Supabase for every PR.

### 4. What to send the client

From **Vercel → Deployments**, open the deployment and use **Visit**. Send that **https** link. If checkout uses Paystack **test** mode, say so (“test payments only”).

### 5. Optional: protect previews

**Vercel → Project → Settings → Deployment Protection** — password or Vercel authentication on **Preview** deployments if you do not want the site publicly discoverable before launch.

---

**Summary:** Push to GitHub → Vercel builds → share the deployment URL → mirror env vars from local → ensure Supabase **Redirect URLs** include `https://<that-host>/auth/callback`. Prefer a **dedicated staging URL** if the client reviews often.

## Troubleshooting

### Yellow dev banner / “Supabase is not configured”

- Ensure `.env.local` has **both** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then **restart** `npm run dev`.

### Paystack verify returns 503

- Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (server-only). Restart after changes.

### Google sign-in redirects but session is lost

- Confirm `/auth/callback` is listed in Supabase Auth URL settings and that `src/middleware.ts` is active.

## Project structure (high level)

- `src/lib/supabase/client.ts` — browser Supabase client (`@supabase/ssr`)
- `src/lib/supabase/server.ts` — server client (OAuth callback)
- `src/lib/supabase/admin.ts` — service role client (API routes)
- `src/lib/supabase/maps.ts` — map DB rows → app types
- `src/context/AuthContext.tsx` / `CartContext.tsx` / `AdminDataContext.tsx`
- `src/components/admin/AdminShell.tsx` + `views/*` — `/admin` dashboard UI
- `src/app/auth/callback/route.ts` — OAuth code exchange
- `src/middleware.ts` — refresh auth cookies
- `src/app/api/paystack/verify/route.ts` — verify payment, insert order, update stock

## Paystack flow

1. Client opens Paystack Inline (amount in pesewas; 100 pesewas = 1 GHS).
2. On success, client POSTs `reference`, `items`, optional `userId` to `/api/paystack/verify`.
3. Server verifies with Paystack, recomputes total from `products`, then inserts into `orders` and updates `stock` using the **service role** client (bypasses RLS).

## License

Private / proprietary — Karlmaxx Investment Limited.
