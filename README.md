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

## Structure

- `index.html`, `styles.css`, `script.js` — static site and price-board behaviour
- `assets/` — static illustrations, category artwork and social preview
- [`web/app/`](./web/app/) — App Router page, metadata, layout and global styles
- [`web/components/`](./web/components/) — header, footer, hero search, brand mark and price board
- [`web/lib/prices.ts`](./web/lib/prices.ts) — shared price data and formatting helpers
- [`web/public/assets/`](./web/public/assets/) — Next.js artwork and social image
