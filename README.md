# Sabeer Solar & Electronic Store

The Next.js storefront is in [`web/`](./web/). It keeps the original storefront design and adds a persistent shopping bag, order checkout, order confirmation, and a password-protected order dashboard.

## Run locally

Use Node.js 20.9 or later:

```powershell
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local development uses a SQLite database at `web/local.db` and seeds the sample products automatically.

To type-check or create a production build:

```powershell
cd web
npm run typecheck
npm run build
npm start
```

## Environment

For production, configure `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `ADMIN_PASSWORD` in the hosting provider's environment settings. See [`web/.env.example`](./web/.env.example) for the variable names. Do not commit `.env.local` or production credentials.

The Next.js app requires a Node.js-compatible host; GitHub Pages cannot run its order API or admin dashboard. The existing [GitHub Pages workflow](./.github/workflows/deploy.yml) still publishes the original static files at the repository root.

## Source and assets

- [`web/app/`](./web/app/) — App Router pages, API routes, and shared layout
- [`web/components/`](./web/components/) — navigation, product grid, cart, checkout, and admin UI
- [`web/lib/`](./web/lib/) — database, product, order, and validation helpers
- [`web/public/assets/`](./web/public/assets/) — storefront artwork and social preview image
- `index.html`, `styles.css`, `script.js`, and `assets/` — original static site, retained for the existing GitHub Pages deployment
