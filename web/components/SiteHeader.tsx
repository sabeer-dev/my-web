"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketMark } from "./MarketMark";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Sabeer Market home">
        <MarketMark />
        <span className="wordmark-text">sabeer<span className="wordmark-period">.</span></span>
        <span className="wordmark-sub">Food price tracker</span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span /><span />
      </button>

      <nav
        className={`site-nav${menuOpen ? " is-open" : ""}`}
        id="site-nav"
        aria-label="Main navigation"
        onClick={() => setMenuOpen(false)}
      >
        <Link href="/#prices">Prices</Link>
        <Link href="/#markets">Markets</Link>
        <Link href="/#how">How it works</Link>
        <a className="nav-alert" href="mailto:shehuusmanumar176@gmail.com?subject=Free%20market%20price%20alert">Set an alert ↗</a>
      </nav>

      <a className="button button-primary button-small header-cta" href="mailto:shehuusmanumar176@gmail.com?subject=Free%20market%20price%20alert">
        Set an alert ↗
      </a>
    </header>
  );
}
