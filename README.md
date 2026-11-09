# Sabeer Solar & Electronic Store

Solar panels, hybrid inverters, deep-cycle batteries and everyday electronics — a static storefront built with plain HTML, CSS and JavaScript.

**Live:** https://sabeer-dev.github.io/my-web/

## How it works

- `index.html` — the whole storefront (hero, categories, products, story, cart dialog)
- `styles.css` — layout, palette, product and category artwork hooks
- `script.js` — cart state, quantity controls, email checkout
- `assets/` — SVG product/hero illustrations and the 1200×630 social preview image
- `.github/workflows/deploy.yml` — deploys to GitHub Pages on every push to `main`

## Notes

- The bag persists in `localStorage` under `sabeer-solar-bag-v1`.
- "Checkout by email" opens the visitor's mail app with an itemised order addressed to the address in `ORDER_EMAIL` (`script.js`). There is no payment backend.
- To change the order address, update `ORDER_EMAIL` in `script.js` and the `mailto:` links in `index.html`.
- Asset URLs are versioned (`styles.css?v=...`) to avoid stale files after a deploy — bump the version when you change CSS or JS.
