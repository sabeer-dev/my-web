# Sabeer Market (Next.js)

Next.js App Router version of the Sabeer Market food price tracker, with a
Supabase-backed price manager at `/admin` and a verified seller portal at
`/seller`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck
npm run build
npm run start
```

## Supabase setup

1. Open your project's **SQL Editor** in the Supabase dashboard.
2. Run [`supabase/schema.sql`](./supabase/schema.sql). It creates the
   `markets`, `sellers` and `price_items` tables, row-level security policies,
   and the starting six markets and 12 items. It also reloads the PostgREST
   schema cache. Use [`supabase/verify.sql`](./supabase/verify.sql) to confirm
   the tables, seed counts and admin role.
3. Create the admin user in **Authentication → Users → Add user** (email and
   password). Alternatively, run
   [`supabase/admin-user.sql`](./supabase/admin-user.sql) after replacing the
   placeholder email and password; it also fills the auth columns that GoTrue
   requires to be empty strings rather than `NULL`.
4. Give that user the admin role. In the user's page, set **Raw App Meta Data**
   to:

   ```json
   { "role": "admin" }
   ```

   Or run this in the SQL Editor with your admin email:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
     || '{"role":"admin"}'::jsonb
   where email = 'you@example.com';
   ```

5. Sign out and sign in again so the JWT includes the new role.
6. Add the environment variables below to `web/.env.local`:

   ```bash
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

The publishable key is safe to use in the browser. The RLS policies allow
public reads, admin writes for users with `app_metadata.role = "admin"`, and
seller updates only for items assigned to that seller. Never commit a
service-role key.

## Seller portal

1. Run [`supabase/seller-user.sql`](./supabase/seller-user.sql) after replacing
   the example email, password, name, and assigned item IDs. This creates the
   Auth user with `app_metadata.role = "seller"`, a verified row in
   `public.sellers`, and assigns the example items.
2. Open `/admin` and check the **Sellers** tab. You can verify or pause a seller
   there.
3. In the **Prices** tab, set the **Owner (seller)** field on each item. Only the
   assigned seller can edit that item.
4. The seller signs in at
   [http://localhost:3000/seller](http://localhost:3000/seller). They can edit
   price, unit, change, 7-day history, sort order and visibility, but not the
   item name, category or market.

RLS enforces the same rule as the UI: a seller cannot update another seller's
item even if they call the API directly.

## Price manager

Start the app and open [http://localhost:3000/admin](http://localhost:3000/admin).
Sign in with the admin account. From there you can:

- Add, edit, hide or delete price items.
- Edit the price, unit, market, category, change percentage and 7-day history.
- Add, rename or delete markets.

Saving a price calls `revalidatePath("/")`, so the public Next.js board refreshes
immediately. The admin page is marked `noindex`.

## Public data and fallbacks

- `lib/market-data.ts` reads markets and active prices from Supabase. If
  Supabase is not configured or the tables are missing, the page falls back to
  the built-in data in `lib/prices.ts`.
- The static GitHub Pages site reads the same Supabase tables through the
  browser using the publishable key in the root `supabase-config.js`. If the
  request fails, it keeps the static snapshot.
- When the admin adds or renames a market, the static site updates its market
  chips, market cards and footer links on the next page load.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `web`.
3. Add the same environment variables from `.env.local` in the Vercel project
   settings. Set `NEXT_PUBLIC_SITE_URL` to the Vercel URL.
4. Deploy. The admin page is at `https://your-project.vercel.app/admin`.

GitHub Pages only hosts the static site; it cannot run the authenticated admin
page. The Next.js app must be deployed separately (Vercel is the simplest
option).

## Structure

- `app/page.tsx` — landing page, now reading live prices and markets
- `app/admin/page.tsx` — authenticated price manager
- `app/admin/actions.ts` — admin sign-in, sign-out and CRUD server actions
- `app/seller/page.tsx` — verified seller portal
- `app/seller/actions.ts` — seller sign-in, sign-out and own-item updates
- `app/layout.tsx` — metadata, fonts and route-aware public chrome
- `app/globals.css` — theme, responsive styles and staff workspace styles
- `components/PriceBoard.tsx` — searchable, filterable price board and watchlist
- `components/admin/` — admin workspace, login, icons and forms
- `components/seller/` — seller workspace, login and restricted price form
- `components/PublicChrome.tsx` — hides public header/footer on staff routes
- `lib/prices.ts` — shared types, fallback data and formatting helpers
- `lib/market-data.ts` — public Supabase reads with fallback
- `lib/admin-data.ts` — authenticated admin reads
- `lib/seller-data.ts` — authenticated seller reads
- `lib/supabase/` — browser, server and public Supabase clients
- `supabase/schema.sql` — tables, RLS policies and seed data
- `supabase/verify.sql` — checks for tables, seeds and the admin role
- `supabase/admin-user.sql` — optional SQL admin-user creation template
- `supabase/seller-user.sql` — optional SQL seller-user creation template
- `public/assets/` — food photography, item thumbnails and social preview
