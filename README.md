# Sabeer Market

A food-market price tracker for Nigerian markets. The repository contains two versions of the same landing page:

- **Static site** at the repository root (`index.html`, `styles.css`, `script.js`, `assets/`) — published to GitHub Pages.
- **Next.js app** in [`web/`](./web/) — the same design built with the App Router.

## Features

- Searchable price board with 12 everyday items across six markets.
- Market and category filters, 7-day sparklines, and a saved watchlist.
- Deep links for searches and filters, e.g. `?q=beans#prices`, `?market=lagos#prices`, `?category=grains#prices`.
- Free weekly alert links by email.
- Responsive layout with custom food illustrations and a social preview image.

## Static site

Open `index.html` directly, or serve the repository root:

```powershell
npx serve .
```

The GitHub Pages workflow publishes the root static files.

## Next.js app

Use Node.js 20.9 or later:

```powershell
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```powershell
cd web
npm run typecheck
npm run build
npm start
```

## Price manager (Supabase)

The Next.js app includes an authenticated admin page at `/admin` for editing
food prices and markets. It is backed by Supabase.

1. Run [`web/supabase/schema.sql`](./web/supabase/schema.sql) in the Supabase SQL Editor.
2. Create an admin user in **Authentication → Users** and set its **App Metadata**
   to `{"role":"admin"}`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to
   `web/.env.local` (see `web/.env.example`).
4. Open `/admin` and sign in.

The public Next.js page reads live prices from Supabase and falls back to the
built-in data if Supabase is unavailable. The static GitHub Pages site reads
the same tables through `supabase-config.js` using the publishable key.

Deploy the admin app to Vercel with the repository root set to `web`. GitHub
Pages only hosts the static site and cannot run the authenticated admin page.
See [`web/README.md`](./web/README.md) for the full setup.

## Structure

- `index.html`, `styles.css`, `script.js` — static site and price-board behaviour
- `supabase-config.js` — public Supabase URL and publishable key for the static site
- `assets/` — static illustrations, category artwork and social preview
- [`web/app/`](./web/app/) — App Router page, admin, metadata, layout and global styles
- [`web/components/`](./web/components/) — header, footer, hero search, brand mark, price board and admin forms
- [`web/lib/prices.ts`](./web/lib/prices.ts) — shared types, fallback price data and formatting helpers
- [`web/lib/market-data.ts`](./web/lib/market-data.ts) — public Supabase reads with fallback
- [`web/supabase/schema.sql`](./web/supabase/schema.sql) — tables, RLS policies and seed data
- [`web/public/assets/`](./web/public/assets/) — Next.js artwork and social image
