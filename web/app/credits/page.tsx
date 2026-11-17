import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Photo credits",
  description:
    "Photo credits for Sabeer Market — the photographers and free-license collections behind our market and food photography."
};

export default function CreditsPage() {
  return (
    <main className="credits-page">
      <p className="eyebrow">Photo credits</p>
      <h1>The people behind the pictures.</h1>
      <p>Real market photography makes the board easier to read. Thank you to the photographers and free-license collections who share their work with the world.</p>

      <div className="credits-grid">
        <section className="credits-card">
          <h2>Market &amp; food photography</h2>
          <p>These photographs come from <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">Pexels</a> and are free to use. We credit the photographers as a courtesy.</p>
          <ul>
            <li><a href="https://www.pexels.com/photo/african-market-stall-with-fresh-produce-35726906/" target="_blank" rel="noreferrer">African market stall with fresh produce</a> — LekePOV</li>
            <li><a href="https://www.pexels.com/photo/seeds-on-a-market-17555574/" target="_blank" rel="noreferrer">Seeds on a market</a> — Mustapha Damilola</li>
            <li><a href="https://www.pexels.com/photo/pile-of-tomatoes-in-the-market-8491056/" target="_blank" rel="noreferrer">Pile of tomatoes in the market</a> — Arturo Krisanto</li>
            <li><a href="https://www.pexels.com/photo/smiling-african-vendor-with-fresh-produce-in-abuja-30464882/" target="_blank" rel="noreferrer">Smiling vendor with fresh produce in Abuja</a> — Muhammad-Taha Ibrahim</li>
            <li><a href="https://www.pexels.com/photo/aerial-view-of-open-air-food-market-with-raw-chicken-37380836/" target="_blank" rel="noreferrer">Open-air market with raw chicken</a> — Pexels contributor</li>
            <li>Additional everyday-item photography from Pexels contributors.</li>
          </ul>
        </section>

        <section className="credits-card">
          <h2>Wikimedia Commons</h2>
          <p>These images are used under their respective Creative Commons licenses. Each link points to the original file and its full attribution.</p>
          <ul>
            <li><a href="https://commons.wikimedia.org/wiki/File:Spices_at_the_market,_Ramatuelle,_2004.jpg" target="_blank" rel="noreferrer">Spices at the market, Ramatuelle, 2004</a> — DimiTalen, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Palm_Oil_in_bottle.jpg" target="_blank" rel="noreferrer">Palm Oil in bottle</a> — Rare Grace, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Peanut_oil_bottle.jpg" target="_blank" rel="noreferrer">Peanut oil bottle</a> — Adam Engelhart, <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA 2.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Bags_of_garri.jpg" target="_blank" rel="noreferrer">Bags of garri</a> — Daniel Paullll, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></li>
          </ul>
        </section>
      </div>

      <p className="credits-note">Images have been cropped, resized and compressed for the web. No other changes were made.</p>
      <Link className="text-link credits-back" href="/">
        Back to Sabeer Market <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}
