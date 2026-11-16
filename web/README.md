# Sabeer Market (Next.js)

Next.js App Router version of the Sabeer Market food price tracker.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run typecheck
npm run build
npm run start
```

## Structure

- `app/page.tsx` — landing page sections
- `app/layout.tsx` — metadata, fonts, announcement bar, header and footer
- `app/globals.css` — theme and responsive styles
- `components/HeroSearch.tsx` — hero search form
- `components/PriceBoard.tsx` — searchable, filterable price board and watchlist
- `components/SiteHeader.tsx`, `components/SiteFooter.tsx` — navigation and footer
- `lib/prices.ts` — shared price data and formatting helpers
- `public/assets/` — SVG artwork and social preview image
