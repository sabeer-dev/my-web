import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <main>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">Solar · Power · Electronics</p>
          <h1 id="hero-title">Power you can<br /><em>count on.</em></h1>
          <p className="hero-copy">Solar panels, hybrid inverters, deep-cycle batteries and everyday electronics — chosen for performance, priced for real life.</p>
          <Link className="button button-light" href="/#shop">Shop solar &amp; electronics <span aria-hidden="true">↘</span></Link>
        </div>
        <div className="hero-caption"><span>SOLAR · INVERTERS · BATTERIES</span><span>HONEST ADVICE · REAL SPECS · EASY SETUP</span></div>
      </section>

      <section className="category-section section-pad" id="categories">
        <div className="section-heading">
          <div><p className="eyebrow">Everything in one place</p><h2>One roof, <em>every watt.</em></h2></div>
          <Link className="text-link" href="/#shop">Browse the shop <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="category-grid">
          <Link className="category-tile category-solar" href="/#shop"><span>Solar &amp; backup</span><span aria-hidden="true">↗</span></Link>
          <Link className="category-tile category-power" href="/#shop"><span>Power &amp; storage</span><span aria-hidden="true">↗</span></Link>
          <Link className="category-tile category-gadgets" href="/#shop"><span>Everyday electronics</span><span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="products section-pad" id="shop">
        <div className="section-heading">
          <div><p className="eyebrow">A few current favorites</p><h2>Power your setup, <em>right now.</em></h2></div>
          <p className="section-aside">Panels, inverters and the small electronics that make a place work — real specs, no guesswork.</p>
        </div>
        <ProductGrid products={products} />
      </section>

      <section className="story section-pad" id="story">
        <div className="story-photo" role="img" aria-label="Rooftop solar installation at golden hour" />
        <div className="story-copy">
          <p className="eyebrow">Why Sabeer Solar</p>
          <h2>Built to keep <em>the lights on.</em></h2>
          <p>Sabeer Solar &amp; Electronic Store started with a simple problem: good solar equipment was hard to find and harder to trust. We stock panels, inverters and batteries we would install in our own homes, and we explain every spec before you pay.</p>
          <a className="text-link" href="mailto:shehuusmanumar176@gmail.com?subject=Solar%20setup%20advice">Ask about your setup <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="newsletter section-pad">
        <div><p className="eyebrow">The occasional good thing</p><h2>Notes from <em>Sabeer Solar.</em></h2></div>
        <p>New stock, installation tips, and honest answers about what your setup really needs. Only when we have something worth sharing.</p>
        <Link className="button button-dark" href="/#shop">Shop the collection <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
