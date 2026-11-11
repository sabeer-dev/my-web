# Sabeer Solar Store — Next.js app

The storefront from the static site, rebuilt in Next.js with a real backend: products come from a database, orders are saved server-side, and there is a password-protected admin page.

## Run locally

```powershell
cd web
npm install
copy .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000. The local database is SQLite (`web/local.db`), created and seeded automatically on first request.

- Storefront: http://localhost:3000
- Checkout: http://localhost:3000/checkout
- Admin: http://localhost:3000/admin (password from `ADMIN_PASSWORD`, defaults to `admin123` in development)

## Data

`lib/db.ts` creates three tables on first use and seeds the four products from the static site:

| Table | Purpose |
|---|---|
| `products` | catalogue: slug, name, price, description, tag, image key, active |
| `orders` | reference, customer details, subtotal, status, created_at |
| `order_items` | snapshot of each line at order time |

Prices are stored as integer dollars. The server recomputes the subtotal from the database on checkout — client-supplied prices are ignored.

## API

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/products` | public | active products |
| `POST` | `/api/orders` | public | `{ customer, items: [{ productId, quantity }] }` → `{ reference, subtotal }` |
| `GET` | `/api/orders` | admin | latest 100 orders with items |
| `POST` | `/api/orders/:id/status` | admin | `{ status }` one of `new`, `confirmed`, `fulfilled`, `cancelled` |
| `POST` | `/api/admin/login` | public | `{ password }`, sets an httpOnly cookie for 8h |
| `POST` | `/api/admin/logout` | admin | clears the cookie |

Admin auth is a single password (`ADMIN_PASSWORD`) exchanged for an HMAC cookie. No user table.

## Deploy to Vercel

1. Create a free Turso database:
   ```powershell
   turso db create sabeer-solar
   turso db show sabeer-solar --url          # -> TURSO_DATABASE_URL
   turso db tokens create sabeer-solar       # -> TURSO_AUTH_TOKEN
   ```
2. Import this repo in Vercel and set **Root Directory** to `web`.
3. Add environment variables:
   - `TURSO_DATABASE_URL` (`libsql://...`)
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSWORD` (a long random string)
   - `NEXT_PUBLIC_SITE_URL` (`https://your-domain`)
4. Deploy. Tables and seed products are created on the first request.

## Notes

- Do not commit `local.db` or `.env.local`.
- After adding a `www` domain, set `NEXT_PUBLIC_SITE_URL` so Open Graph URLs and the canonical host resolve correctly.
