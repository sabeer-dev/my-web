import Link from "next/link";
import { MarketMark } from "./MarketMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="wordmark footer-wordmark" href="/" aria-label="Sabeer Market home">
            <MarketMark />
            <span className="wordmark-text">sabeer<span className="wordmark-period">.</span></span>
            <span className="wordmark-sub">Food price tracker</span>
          </Link>
          <p>Food prices you can plan around. Morning checks across Nigeria&apos;s busiest markets, in one calm place.</p>
        </div>
        <div className="footer-links">
          <h3>Prices</h3>
          <a href="/?category=grains#prices">Grains &amp; staples</a>
          <a href="/?category=vegetables#prices">Vegetables</a>
          <a href="/?category=proteins#prices">Proteins</a>
          <a href="/?category=oils#prices">Oils &amp; spices</a>
        </div>
        <div className="footer-links">
          <h3>Markets</h3>
          <a href="/?market=lagos#prices">Lagos</a>
          <a href="/?market=abuja#prices">Abuja</a>
          <a href="/?market=kano#prices">Kano</a>
          <a href="/?market=port-harcourt#prices">Port Harcourt</a>
        </div>
        <div className="footer-contact-block">
          <h3>Talk to us</h3>
          <a className="footer-contact" href="mailto:shehuusmanumar176@gmail.com">shehuusmanumar176@gmail.com</a>
          <span>Tell us which market or item you want us to track next.</span>
          <a className="button button-primary button-small" href="mailto:shehuusmanumar176@gmail.com?subject=Market%20price%20suggestion">
            Suggest a market <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Sabeer Market</span>
        <span>Prices checked every morning. Always confirm at the stall.</span>
        <Link className="back-top" href="/#home">Back to top ↑</Link>
      </div>
    </footer>
  );
}
