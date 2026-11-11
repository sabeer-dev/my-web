import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark footer-wordmark" href="/">
        <span className="wordmark-icon" aria-hidden="true">S</span>
        <span>sabeer<span className="wordmark-period">.</span></span>
        <span className="wordmark-sub">Solar</span>
      </Link>
      <span>Power you can count on.</span>
      <span>© {new Date().getFullYear()} Sabeer Solar &amp; Electronic Store</span>
      <a className="text-link footer-contact" href="mailto:shehuusmanumar176@gmail.com">Questions? Email us</a>
      <Link className="back-top" href="/">Back to top ↑</Link>
    </footer>
  );
}
