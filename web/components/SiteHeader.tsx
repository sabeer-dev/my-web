"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Sabeer Solar and Electronic Store home">
        <span className="wordmark-icon" aria-hidden="true">S</span>
        <span>sabeer<span className="wordmark-period">.</span></span>
        <span className="wordmark-sub">Solar</span>
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

      <nav className={`site-nav${menuOpen ? " is-open" : ""}`} id="site-nav" aria-label="Main navigation" onClick={() => setMenuOpen(false)}>
        <Link href="/#shop">Shop all</Link>
        <Link href="/#categories">Categories</Link>
        <Link href="/#story">Our story</Link>
      </nav>

      <button
        className="bag-button"
        type="button"
        aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
        aria-haspopup="dialog"
        aria-controls="cart-dialog"
        onClick={openCart}
      >
        Bag <span className="bag-count" aria-hidden="true">{count}</span>
      </button>
    </header>
  );
}
