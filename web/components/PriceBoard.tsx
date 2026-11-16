"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_KEYS,
  CATEGORY_VALUES,
  MARKET_KEYS,
  WATCHLIST_KEY,
  categoryOptions,
  changeClass,
  changeLabel,
  marketOptions,
  money,
  prices,
  slug,
  sparkBars
} from "@/lib/prices";

function scrollToPriceSection() {
  const section = document.getElementById("prices");
  if (!section) return;

  const header = document.querySelector<HTMLElement>(".site-header");
  const offset = (header?.getBoundingClientRect().height ?? 82) + 18;

  window.scrollTo({
    top: section.getBoundingClientRect().top + window.scrollY - offset,
    behavior: "auto"
  });
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3.4 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3.4Z" />
    </svg>
  );
}

export function PriceBoard() {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("all");
  const [category, setCategory] = useState("all");
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = (params.get("q") ?? "").trim();
    const initialMarket = params.get("market") ?? "all";
    const initialCategory = params.get("category") ?? "all";
    const hasMarket = (MARKET_KEYS as readonly string[]).includes(initialMarket);
    const hasCategory = (CATEGORY_VALUES as readonly string[]).includes(initialCategory);

    if (initialQuery) setQuery(initialQuery);
    if (hasMarket) setMarket(initialMarket);
    if (hasCategory) setCategory(initialCategory);

    try {
      const stored = JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]");
      if (Array.isArray(stored)) {
        const valid = new Set(prices.map((item) => item.id));
        setWatchlist(new Set(stored.filter((id): id is string => typeof id === "string" && valid.has(id))));
      }
    } catch {
      /* Storage can be unavailable in private browsing. The board still works. */
    }

    // Deep links filter the board after hydration, so align the section again
    // once the final row count is in the DOM.
    if (initialQuery || hasMarket || hasCategory || window.location.hash === "#prices") {
      // The browser can restore scroll after a same-path navigation and late
      // font loading can move the board, so keep it aligned while layout settles.
      let cancelled = false;
      const align = () => {
        if (!cancelled) scrollToPriceSection();
      };
      const timers = [90, 450, 1200, 2400].map((delay) => window.setTimeout(align, delay));

      if (document.fonts) {
        document.fonts.ready.then(align).catch(() => {});
      }
      window.addEventListener("load", align, { once: true });

      return () => {
        cancelled = true;
        timers.forEach((timer) => window.clearTimeout(timer));
        window.removeEventListener("load", align);
      };
    }
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return prices.filter((item) => {
      if (market !== "all" && slug(item.market) !== market) return false;
      if (category !== "all" && CATEGORY_KEYS[item.category] !== category) return false;
      if (watchlistOnly && !watchlist.has(item.id)) return false;

      if (search) {
        const haystack = `${item.name} ${item.category} ${item.market} ${item.unit}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [category, market, query, watchlist, watchlistOnly]);

  function toggleWatch(id: string) {
    setWatchlist((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...next]));
      } catch {
        /* Keep the in-memory watchlist working when storage is blocked. */
      }

      return next;
    });
  }

  function clearAll() {
    setQuery("");
    setMarket("all");
    setCategory("all");
    setWatchlistOnly(false);
  }

  const emptyWatchlist = watchlistOnly && watchlist.size === 0;
  const itemLabel = filtered.length === 1 ? "item" : "items";

  return (
    <div className="price-shell">
      <div className="price-toolbar">
        <label className="search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.4" />
            <path d="m16 16 4.2 4.2" />
          </svg>
          <input
            type="search"
            id="price-search"
            placeholder="Search rice, tomatoes, beans..."
            autoComplete="off"
            aria-label="Search the price board"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button
          className={`watchlist-toggle${watchlistOnly ? " is-active" : ""}`}
          id="watchlist-toggle"
          type="button"
          aria-pressed={watchlistOnly}
          onClick={() => setWatchlistOnly((value) => !value)}
        >
          <StarIcon />
          Watchlist <span id="watchlist-count">{watchlist.size}</span>
        </button>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <span className="filter-label">Market</span>
          <div className="market-chips" id="market-chips" role="group" aria-label="Filter by market">
            {marketOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-chip${market === option.value ? " is-active" : ""}`}
                type="button"
                data-market={option.value}
                onClick={() => setMarket(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="category-tabs" id="category-tabs" role="group" aria-label="Filter by category">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-chip${category === option.value ? " is-active" : ""}`}
                type="button"
                data-category={option.value}
                onClick={() => setCategory(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="price-table-wrap">
        <table className="price-table">
          <caption className="sr-only">Today&apos;s food prices by item and market</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Market</th>
              <th scope="col">Unit</th>
              <th scope="col">Price</th>
              <th scope="col">Today</th>
              <th scope="col">7-day</th>
              <th scope="col"><span className="sr-only">Track</span></th>
            </tr>
          </thead>
          <tbody id="price-rows">
            {filtered.map((item) => {
              const tracked = watchlist.has(item.id);
              const trend = changeClass(item.change);

              return (
                <tr key={item.id}>
                  <td className="price-item-cell">
                    <div className="price-item">
                      <span className={`price-dot price-dot--${CATEGORY_KEYS[item.category]}`} aria-hidden="true" />
                      <span><strong>{item.name}</strong><small>{item.category}</small></span>
                    </div>
                  </td>
                  <td className="price-market-cell price-market">
                    <strong>{item.market}</strong>
                    <small>
                      <span className="price-market-updated">Updated 7:00 AM</span>
                      <span className="price-unit-mobile">{item.unit} · 7:00 AM</span>
                    </small>
                  </td>
                  <td className="price-unit-cell"><span className="price-unit">{item.unit}</span></td>
                  <td className="price-value-cell"><span className="price-value">{money(item.price)}</span></td>
                  <td className="price-change-cell"><span className={`price-change ${trend}`}>{changeLabel(item.change)}</span></td>
                  <td className="price-spark-cell">
                    <span className={`spark ${trend}`} aria-hidden="true">
                      {sparkBars(item.history).map((height, index) => (
                        <i key={index} style={{ height: `${height}%` }} />
                      ))}
                    </span>
                  </td>
                  <td className="price-track-cell">
                    <button
                      className={`track-button${tracked ? " is-tracked" : ""}`}
                      type="button"
                      data-id={item.id}
                      aria-pressed={tracked}
                      aria-label={`${tracked ? "Stop tracking" : "Track"} ${item.name}`}
                      onClick={() => toggleWatch(item.id)}
                    >
                      <StarIcon />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="price-empty" id="price-empty">
          <strong>{emptyWatchlist ? "Your watchlist is empty." : "No prices match that search."}</strong>
          <p>
            {emptyWatchlist
              ? "Tap the star beside an item to save it here."
              : "Try a different item, market or category."}
          </p>
          <button className="button button-dark button-small" id="clear-filters" type="button" onClick={clearAll}>
            Clear filters
          </button>
        </div>
      )}

      <div className="price-footer">
        <span id="price-count" aria-live="polite">
          Showing {filtered.length} of {prices.length} {itemLabel}{watchlistOnly ? " in your watchlist" : ""}
        </span>
        <span className="price-updated"><i aria-hidden="true" />Checked at 7:00 AM</span>
        <a
          className="text-link"
          href="mailto:shehuusmanumar176@gmail.com?subject=Weekly%20food%20price%20alert"
        >
          Get weekly alerts <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
