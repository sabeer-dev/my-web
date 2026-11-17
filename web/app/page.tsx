import { HeroSearch } from "@/components/HeroSearch";
import { PriceBoard } from "@/components/PriceBoard";

const categories = [
  { slug: "grains", className: "category-grains", label: "Grains & staples", detail: "Rice, beans, maize, garri" },
  { slug: "vegetables", className: "category-vegetables", label: "Vegetables", detail: "Tomatoes, onions, peppers, yam" },
  { slug: "proteins", className: "category-proteins", label: "Proteins", detail: "Eggs, chicken, fish, beef" },
  { slug: "oils", className: "category-oils", label: "Oils & spices", detail: "Palm oil, cooking oil, ginger, garlic" }
];

const markets = [
  { slug: "lagos", name: "Lagos", detail: "Mile 12 · Oshodi · Ikeja" },
  { slug: "abuja", name: "Abuja", detail: "Wuse · Garki · Nyanya" },
  { slug: "kano", name: "Kano", detail: "Dawanau · Kurmi" },
  { slug: "kaduna", name: "Kaduna", detail: "Barnawa · Kasuwa" },
  { slug: "port-harcourt", name: "Port Harcourt", detail: "Mile 3 · Rumuokoro" },
  { slug: "ibadan", name: "Ibadan", detail: "Bodija · Oja'ba" }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-shade" />
        <div className="hero-inner">
          <div className="hero-content">
            <p className="eyebrow hero-eyebrow"><span className="pulse" aria-hidden="true" />Live food market prices · Updated this morning</p>
            <h1 id="hero-title">Know the price<br /> before you <em>leave home.</em></h1>
            <p className="hero-copy">Track rice, beans, tomatoes, onions, proteins and cooking essentials across Nigeria&apos;s busiest markets. One calm place to plan your week — and spot a fair price when you see one.</p>
            <HeroSearch />
            <div className="hero-actions">
              <a className="button button-primary" href="#prices">Browse today&apos;s prices <span aria-hidden="true">↘</span></a>
              <a className="button button-ghost" href="mailto:shehuusmanumar176@gmail.com?subject=Free%20market%20price%20alert">Set a free alert</a>
            </div>
          </div>
        </div>
        <div className="hero-caption"><span>RICE ₦78,000 ↑ · TOMATOES ₦32,000 ↑ · BEANS ₦65,000 ↓ · ONIONS ₦45,000 ↓ · EGGS ₦5,200 →</span><span>HONEST PRICES · REAL MARKETS · EVERY MORNING</span></div>
      </section>

      <div className="trust-strip" aria-label="Why use Sabeer Market">
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg></span>
          <span><strong>Morning checks</strong><small>Prices updated by 7 AM</small></span>
        </div>
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s6.5-5.5 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.5 12 21 12 21Z" /><circle cx="12" cy="10" r="2.4" /></svg></span>
          <span><strong>24 markets</strong><small>Across 12 states</small></span>
        </div>
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 9.5h15l-1.6 9.2a1.6 1.6 0 0 1-1.6 1.3H7.7a1.6 1.6 0 0 1-1.6-1.3L4.5 9.5Z" /><path d="M8.3 9.5a3.7 3.7 0 0 1 7.4 0" /><path d="M9 13.6v2.6M15 13.6v2.6" /></svg></span>
          <span><strong>180+ items</strong><small>Staples to spices</small></span>
        </div>
        <div className="trust-item">
          <span className="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z" /><path d="M10 19a2.2 2.2 0 0 0 4 0" /></svg></span>
          <span><strong>Free alerts</strong><small>No account needed</small></span>
        </div>
      </div>

      <section className="category-section section-pad" id="categories">
        <div className="section-heading">
          <div><p className="eyebrow">Everything in the basket</p><h2>Shop the market <em>by category.</em></h2></div>
          <a className="text-link" href="#prices">See every price <span aria-hidden="true">↗</span></a>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <a
              className="category-tile"
              href={`/?category=${category.slug}#prices`}
              aria-label={`See prices for ${category.label}`}
              key={category.slug}
            >
              <span className={`category-media ${category.className}`} aria-hidden="true" />
              <span className="category-body">
                <span className="category-index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.label}</strong>
                <span className="category-text">{category.detail}</span>
              </span>
              <span className="category-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="prices section-pad" id="prices">
        <div className="section-heading">
          <div><p className="eyebrow">Today&apos;s market board</p><h2>Today&apos;s prices, <em>at a glance.</em></h2></div>
          <p className="section-aside">A fair price is easier to spot when you can see the whole market. Search an item, pick a city, and compare the week&apos;s movement.</p>
        </div>
        <PriceBoard />
      </section>

      <section className="how section-pad" id="how">
        <div className="section-heading">
          <div><p className="eyebrow">How it works</p><h2>A calmer way to <em>shop the market.</em></h2></div>
          <p className="section-aside">No guessing, no calling three different vendors. Just a quick check before you head out.</p>
        </div>
        <div className="how-grid">
          <article className="how-card">
            <span className="how-index">01</span>
            <span className="how-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s6.5-5.5 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.5 12 21 12 21Z" /><circle cx="12" cy="10" r="2.4" /></svg></span>
            <h3>Pick your market</h3>
            <p>Choose Lagos, Abuja, Kano, Kaduna or any market we cover. Every price is tied to a real city.</p>
          </article>
          <article className="how-card">
            <span className="how-index">02</span>
            <span className="how-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg></span>
            <h3>Search your staples</h3>
            <p>See today&apos;s price, the unit it is sold in, and how it moved over the last seven days.</p>
          </article>
          <article className="how-card">
            <span className="how-index">03</span>
            <span className="how-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z" /><path d="M10 19a2.2 2.2 0 0 0 4 0" /></svg></span>
            <h3>Watch what matters</h3>
            <p>Save the items you buy often and get a short weekly alert when the market moves.</p>
          </article>
        </div>
      </section>

      <section className="markets section-pad" id="markets">
        <div className="markets-panel">
          <div>
            <p className="eyebrow">Market coverage</p>
            <h2>Six cities today. <em>More every month.</em></h2>
            <p>We start with the markets our neighbours shop most, then add new cities as we grow. Tap a market to see its board.</p>
          </div>
          <div className="market-grid">
            {markets.map((market) => (
              <a className="market-card" href={`/?market=${market.slug}#prices`} key={market.slug}>
                <span className="market-dot" aria-hidden="true" />
                <span className="market-text"><strong>{market.name}</strong><small>{market.detail}</small></span>
                <span className="market-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="story-visual">
          <div className="story-photo" role="img" aria-label="A smiling vendor arranging fresh produce at an Abuja food market" />
          <div className="story-badge"><strong>24</strong><span>markets checked daily</span></div>
        </div>
        <div className="story-copy">
          <p className="eyebrow">Why Sabeer Market</p>
          <h2>Built for the way <em>we actually shop.</em></h2>
          <p>Food prices move fast. Sabeer Market checks the stalls, gathers the numbers, and turns them into a simple daily picture — so you can budget with confidence and know a fair price when you see one.</p>
          <ul className="story-list">
            <li>Morning checks across 24 markets</li>
            <li>Clear units and market names, no surprises</li>
            <li>Free weekly alerts for the items you track</li>
          </ul>
          <a className="text-link" href="mailto:shehuusmanumar176@gmail.com?subject=Question%20about%20market%20prices">Ask about your market <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="cta section-pad" id="alerts">
        <div className="cta-panel">
          <div>
            <p className="eyebrow">A short weekly note</p>
            <h2>Know before <em>the market moves.</em></h2>
            <p>Get a short weekly alert with the staples you track and the biggest price moves. No account, no noise — just the numbers you need before you shop.</p>
          </div>
          <div className="cta-actions">
            <a className="button button-light" href="mailto:shehuusmanumar176@gmail.com?subject=Free%20market%20price%20alert">Set a free alert <span aria-hidden="true">↗</span></a>
            <a className="button button-outline" href="#prices">Browse today&apos;s prices</a>
          </div>
        </div>
      </section>
    </main>
  );
}
