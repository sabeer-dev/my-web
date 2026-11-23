"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteMarket, deletePrice, setSellerVerified, signOut } from "@/app/admin/actions";
import type { AdminMarket, AdminPriceItem, AdminSeller } from "@/lib/admin-types";
import { CATEGORY_NAMES } from "@/lib/prices";
import { money, RelativeTime } from "@/components/format";
import { Icon, type AdminIconName } from "./AdminIcons";
import { MarketForm } from "./MarketForm";
import { PriceForm } from "./PriceForm";

type Tab = "overview" | "prices" | "markets" | "sellers";
type Banner = { tone: "error" | "success"; message: string } | null;
type PendingDelete = { type: "price" | "market"; id: string; name: string } | null;

type Props = {
  markets: AdminMarket[];
  sellers: AdminSeller[];
  items: AdminPriceItem[];
  email: string;
  banner: Banner;
};

const tabs: { id: Tab; label: string; icon: AdminIconName }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "prices", label: "Prices", icon: "tag" },
  { id: "markets", label: "Markets", icon: "store" },
  { id: "sellers", label: "Sellers", icon: "users" }
];

const tabMeta: Record<Tab, { eyebrow: string; title: string; subtitle: string }> = {
  overview: {
    eyebrow: "Staff workspace",
    title: "Price manager",
    subtitle: "A clear view of what is live, what changed, and where coverage needs attention."
  },
  prices: {
    eyebrow: "Price board",
    title: "Food prices",
    subtitle: "Edit a row, adjust its visibility, and save. Changes appear on the public board."
  },
  markets: {
    eyebrow: "Coverage",
    title: "Markets",
    subtitle: "Manage the market names and details used by the public filters and market cards."
  },
  sellers: {
    eyebrow: "Team",
    title: "Sellers",
    subtitle: "Verify seller accounts and see which price items each seller can update."
  }
};

function userInitials(email: string) {
  const seed = email.split("@")[0] ?? "staff";
  return seed
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="admin-empty">
      <span className="admin-empty-icon">
        <Icon name="search" size={20} />
      </span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export function AdminWorkspace({ markets, sellers, items, email, banner }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [marketSearch, setMarketSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [addPriceOpen, setAddPriceOpen] = useState(false);
  const [addMarketOpen, setAddMarketOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editingMarket, setEditingMarket] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    setBannerDismissed(false);
  }, [banner?.message]);

  useEffect(() => {
    if (!pendingDelete) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingDelete(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pendingDelete]);

  const marketNames = useMemo(
    () => new Map(markets.map((market) => [market.id, market.name])),
    [markets]
  );

  const itemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => counts.set(item.market_id, (counts.get(item.market_id) ?? 0) + 1));
    return counts;
  }, [items]);

  const sellerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      if (item.seller_id) counts.set(item.seller_id, (counts.get(item.seller_id) ?? 0) + 1);
    });
    return counts;
  }, [items]);

  const liveCount = useMemo(() => items.filter((item) => item.active).length, [items]);

  const lastUpdated = useMemo(
    () =>
      items.reduce<string | null>(
        (latest, item) => (!latest || (item.updated_at ?? "") > latest ? item.updated_at : latest),
        null
      ),
    [items]
  );

  const maxMarketCount = useMemo(
    () => Math.max(1, ...Array.from(itemCounts.values())),
    [itemCounts]
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((item) => {
        const marketName = marketNames.get(item.market_id) ?? "";
        const matchesTerm =
          !term ||
          `${item.name} ${item.category} ${item.unit} ${marketName} ${item.id}`
            .toLowerCase()
            .includes(term);
        const matchesCategory = category === "all" || item.category === category;
        const matchesStatus =
          status === "all" || (status === "live" ? item.active : !item.active);
        const matchesMarket = marketFilter === "all" || item.market_id === marketFilter;
        return matchesTerm && matchesCategory && matchesStatus && matchesMarket;
      })
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.name.localeCompare(b.name)
      );
  }, [items, search, category, status, marketFilter, marketNames]);

  const recentItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
        .slice(0, 5),
    [items]
  );

  const filteredMarkets = useMemo(() => {
    const term = marketSearch.trim().toLowerCase();
    return markets
      .filter(
        (market) =>
          !term || `${market.name} ${market.detail} ${market.id}`.toLowerCase().includes(term)
      )
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }, [markets, marketSearch]);

  const meta = tabMeta[tab];
  const navCounts: Record<Tab, number | null> = {
    overview: null,
    prices: items.length,
    markets: markets.length,
    sellers: sellers.length
  };

  function openAddPrice() {
    setTab("prices");
    setAddPriceOpen(true);
    setEditingPrice(null);
  }

  function openAddMarket() {
    setTab("markets");
    setAddMarketOpen(true);
    setEditingMarket(null);
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">s.</span>
          <span>
            <strong>Sabeer Market</strong>
            <small>PRICE TRACKER</small>
          </span>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`admin-nav-item${tab === entry.id ? " is-active" : ""}`}
              onClick={() => setTab(entry.id)}
              aria-current={tab === entry.id ? "page" : undefined}
            >
              <Icon name={entry.icon} size={17} />
              <span>{entry.label}</span>
              {navCounts[entry.id] !== null ? (
                <span className="admin-nav-count">{navCounts[entry.id]}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-note">
            <Icon name="shield" size={16} />
            <span>Staff access only</span>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">{userInitials(email)}</span>
            <span className="admin-user-copy">
              <strong>Administrator</strong>
              <small title={email}>{email}</small>
            </span>
          </div>
          <form action={signOut}>
            <button className="admin-signout" type="submit">
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p className="admin-lede">{meta.subtitle}</p>
          </div>
          <div className="admin-top-actions">
            <Link className="text-link" href="/" target="_blank" rel="noreferrer">
              View public site
              <Icon name="external" size={14} />
            </Link>
            {tab !== "sellers" ? (
              <button
                className="button button-primary button-small"
                type="button"
                onClick={tab === "markets" ? openAddMarket : openAddPrice}
              >
                <Icon name="plus" size={15} />
                {tab === "markets" ? "Add market" : "Add price"}
              </button>
            ) : null}
          </div>
        </header>

        <nav className="admin-mobile-tabs" aria-label="Admin sections">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={tab === entry.id ? "is-active" : ""}
              onClick={() => setTab(entry.id)}
              aria-current={tab === entry.id ? "page" : undefined}
            >
              <Icon name={entry.icon} size={16} />
              {entry.label}
            </button>
          ))}
        </nav>

        {banner && !bannerDismissed ? (
          <div className={`admin-banner is-${banner.tone}`} role="status">
            <Icon name={banner.tone === "success" ? "check" : "alert"} size={16} />
            <span>{banner.message}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setBannerDismissed(true)}
            >
              ×
            </button>
          </div>
        ) : null}

        <section className="admin-stats" aria-label="Workspace summary">
          <article className="admin-stat">
            <span className="admin-stat-icon">
              <Icon name="package" size={18} />
            </span>
            <span className="admin-stat-label">Total items</span>
            <strong className="admin-stat-value">{items.length}</strong>
            <span className="admin-stat-foot">Across {markets.length} markets</span>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-icon is-live">
              <Icon name="activity" size={18} />
            </span>
            <span className="admin-stat-label">Live on board</span>
            <strong className="admin-stat-value">{liveCount}</strong>
            <span className="admin-stat-foot">
              {items.length - liveCount} hidden from the public board
            </span>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-icon">
              <Icon name="store" size={18} />
            </span>
            <span className="admin-stat-label">Markets</span>
            <strong className="admin-stat-value">{markets.length}</strong>
            <span className="admin-stat-foot">Available in public filters</span>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-icon is-amber">
              <Icon name="clock" size={18} />
            </span>
            <span className="admin-stat-label">Last update</span>
            <strong className="admin-stat-value admin-stat-time">
              <RelativeTime value={lastUpdated} />
            </strong>
            <span className="admin-stat-foot">Most recent price change</span>
          </article>
        </section>

        {tab === "overview" ? (
          <div className="admin-overview-grid">
            <section className="admin-card-surface">
              <header className="admin-panel-head">
                <div>
                  <p className="eyebrow">Activity</p>
                  <h2>Recent updates</h2>
                </div>
                <button className="admin-link-button" type="button" onClick={() => setTab("prices")}>
                  All prices →
                </button>
              </header>
              {recentItems.length ? (
                <div className="admin-compact-list">
                  {recentItems.map((item) => (
                    <div className="admin-compact-row" key={item.id}>
                      <span
                        className={`admin-compact-dot${item.active ? " is-live" : ""}`}
                        aria-hidden="true"
                      />
                      <div className="admin-compact-copy">
                        <strong>{item.name}</strong>
                        <small>
                          {marketNames.get(item.market_id) ?? "Unknown market"} · {item.unit}
                        </small>
                      </div>
                      <strong className="admin-compact-price">{money(item.price)}</strong>
                      <small className="admin-compact-time">
                        <RelativeTime value={item.updated_at} />
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No price items yet" message="Add your first item to get started." />
              )}
            </section>

            <section className="admin-card-surface">
              <header className="admin-panel-head">
                <div>
                  <p className="eyebrow">Coverage</p>
                  <h2>Items by market</h2>
                </div>
                <button className="admin-link-button" type="button" onClick={() => setTab("markets")}>
                  Manage →
                </button>
              </header>
              <div className="admin-coverage-list">
                {markets.map((market) => {
                  const count = itemCounts.get(market.id) ?? 0;
                  return (
                    <div className="admin-coverage-row" key={market.id}>
                      <div className="admin-coverage-copy">
                        <strong>{market.name}</strong>
                        <span>{count} items</span>
                      </div>
                      <div className="admin-progress" aria-hidden="true">
                        <span style={{ width: `${(count / maxMarketCount) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="admin-card-surface admin-guide">
              <header className="admin-panel-head">
                <div>
                  <p className="eyebrow">How it works</p>
                  <h2>Three steps to a fresh price board</h2>
                </div>
              </header>
              <div className="admin-guide-grid">
                <div>
                  <span className="admin-step">01</span>
                  <strong>Choose a market</strong>
                  <p>Add or edit a market in the Coverage tab.</p>
                </div>
                <div>
                  <span className="admin-step">02</span>
                  <strong>Set the price</strong>
                  <p>Add the item, unit, price, and seven-day history.</p>
                </div>
                <div>
                  <span className="admin-step">03</span>
                  <strong>Go live</strong>
                  <p>Keep Visible on, then save. The public board updates.</p>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "prices" ? (
          <>
            <div className="admin-toolbar">
              <label className="admin-search">
                <Icon name="search" size={16} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search items, markets, units…"
                  aria-label="Search price items"
                />
              </label>
              <label className="admin-select">
                <span>Category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">All categories</option>
                  {CATEGORY_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-select">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="live">Live</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <label className="admin-select">
                <span>Market</span>
                <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}>
                  <option value="all">All markets</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <section className="admin-card-surface">
              <header className="admin-panel-head">
                <div>
                  <p className="eyebrow">Price board</p>
                  <h2>
                    {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                  </h2>
                </div>
                <button
                  className="button button-outline-light button-small"
                  type="button"
                  onClick={() => {
                    setAddPriceOpen((open) => !open);
                    setEditingPrice(null);
                  }}
                >
                  <Icon name="plus" size={15} />
                  {addPriceOpen ? "Close form" : "New item"}
                </button>
              </header>

              {addPriceOpen ? (
                <div className="admin-form-panel">
                  <div className="admin-form-panel-head">
                    <strong>New price item</strong>
                    <span>Fields marked required must be filled in.</span>
                  </div>
                  <PriceForm markets={markets} sellers={sellers} onCancel={() => setAddPriceOpen(false)} />
                </div>
              ) : null}

              {filteredItems.length ? (
                <div className="admin-list">
                  {filteredItems.map((item) => {
                    const editing = editingPrice === item.id;
                    return (
                      <article className={`admin-row-wrap${editing ? " is-editing" : ""}`} key={item.id}>
                        <div className="admin-row">
                          <div className="admin-row-primary">
                            <div className="admin-row-title-line">
                              <strong>{item.name}</strong>
                              <span className={`admin-status${item.active ? " is-live" : ""}`}>
                                {item.active ? "Live" : "Hidden"}
                              </span>
                            </div>
                            <small>
                              {item.category} · {item.unit}
                            </small>
                          </div>
                          <div className="admin-row-market">
                            <strong>{marketNames.get(item.market_id) ?? "Unknown market"}</strong>
                            <small>{item.id}</small>
                          </div>
                          <div className="admin-row-price">
                            <strong>{money(item.price)}</strong>
                            <small>current price</small>
                          </div>
                          <div className="admin-row-change">
                            <span
                              className={`admin-change${
                                item.change > 0 ? " is-up" : item.change < 0 ? " is-down" : ""
                              }`}
                            >
                              {item.change > 0 ? "↑" : item.change < 0 ? "↓" : "→"}{" "}
                              {Math.abs(item.change).toFixed(1)}%
                            </span>
                            <small>
                              <RelativeTime value={item.updated_at} />
                            </small>
                          </div>
                          <div className="admin-row-actions">
                            <button
                              className="admin-icon-button"
                              type="button"
                              aria-label={`Edit ${item.name}`}
                              title="Edit item"
                              onClick={() => {
                                setEditingPrice(editing ? null : item.id);
                                setAddPriceOpen(false);
                              }}
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            <button
                              className="admin-icon-button is-danger"
                              type="button"
                              aria-label={`Delete ${item.name}`}
                              title="Delete item"
                              onClick={() =>
                                setPendingDelete({ type: "price", id: item.id, name: item.name })
                              }
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </div>
                        {editing ? (
                          <div className="admin-row-editor">
                            <PriceForm markets={markets} sellers={sellers} item={item} onCancel={() => setEditingPrice(null)} />
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No matching prices"
                  message="Try a different search or clear the filters above."
                />
              )}
            </section>
          </>
        ) : null}

        {tab === "markets" ? (
          <>
            <div className="admin-toolbar">
              <label className="admin-search">
                <Icon name="search" size={16} />
                <input
                  type="search"
                  value={marketSearch}
                  onChange={(event) => setMarketSearch(event.target.value)}
                  placeholder="Search markets…"
                  aria-label="Search markets"
                />
              </label>
            </div>

            <section className="admin-card-surface">
              <header className="admin-panel-head">
                <div>
                  <p className="eyebrow">Coverage</p>
                  <h2>
                    {filteredMarkets.length} {filteredMarkets.length === 1 ? "market" : "markets"}
                  </h2>
                </div>
                <button
                  className="button button-outline-light button-small"
                  type="button"
                  onClick={() => {
                    setAddMarketOpen((open) => !open);
                    setEditingMarket(null);
                  }}
                >
                  <Icon name="plus" size={15} />
                  {addMarketOpen ? "Close form" : "New market"}
                </button>
              </header>

              {addMarketOpen ? (
                <div className="admin-form-panel">
                  <div className="admin-form-panel-head">
                    <strong>New market</strong>
                    <span>Used by the public filters and market cards.</span>
                  </div>
                  <MarketForm onCancel={() => setAddMarketOpen(false)} />
                </div>
              ) : null}

              {filteredMarkets.length ? (
                <div className="admin-market-grid">
                  {filteredMarkets.map((market) => {
                    const count = itemCounts.get(market.id) ?? 0;
                    const editing = editingMarket === market.id;
                    return (
                      <article className={`admin-market-card${editing ? " is-editing" : ""}`} key={market.id}>
                        <div className="admin-market-card-head">
                          <div>
                            <strong>{market.name}</strong>
                            <small>{market.detail || "No detail added"}</small>
                          </div>
                          <span className="admin-market-count">{count} items</span>
                        </div>
                        <div className="admin-market-card-foot">
                          <span>Order {market.sort_order}</span>
                          <div className="admin-row-actions">
                            <button
                              className="admin-icon-button"
                              type="button"
                              aria-label={`Edit ${market.name}`}
                              title="Edit market"
                              onClick={() => {
                                setEditingMarket(editing ? null : market.id);
                                setAddMarketOpen(false);
                              }}
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            <button
                              className="admin-icon-button is-danger"
                              type="button"
                              aria-label={`Delete ${market.name}`}
                              title={count ? "Remove its items first" : "Delete market"}
                              disabled={count > 0}
                              onClick={() =>
                                setPendingDelete({ type: "market", id: market.id, name: market.name })
                              }
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </div>
                        {editing ? (
                          <div className="admin-market-editor">
                            <MarketForm market={market} onCancel={() => setEditingMarket(null)} />
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No matching markets" message="Try a different search." />
              )}
            </section>
          </>
        ) : null}

        {tab === "sellers" ? (
          <section className="admin-card-surface">
            <header className="admin-panel-head">
              <div>
                <p className="eyebrow">Team</p>
                <h2>
                  {sellers.length} {sellers.length === 1 ? "seller" : "sellers"}
                </h2>
              </div>
              <Link className="text-link" href="/seller" target="_blank" rel="noreferrer">
                Seller portal
                <Icon name="external" size={14} />
              </Link>
            </header>

            {sellers.length ? (
              <div className="admin-market-grid">
                {sellers.map((seller) => {
                  const assigned = sellerCounts.get(seller.id) ?? 0;
                  return (
                    <article className="admin-market-card" key={seller.id}>
                      <div className="admin-market-card-head">
                        <div>
                          <strong>{seller.name}</strong>
                          <small title={seller.email}>{seller.email}</small>
                        </div>
                        <span
                          className={`admin-status${seller.verified ? " is-live" : ""}`}
                        >
                          {seller.verified ? "Verified" : "Paused"}
                        </span>
                      </div>
                      <div className="admin-market-card-foot">
                        <span>{assigned} assigned items</span>
                        <form action={setSellerVerified}>
                          <input type="hidden" name="id" value={seller.id} />
                          <input
                            type="hidden"
                            name="verified"
                            value={seller.verified ? "false" : "true"}
                          />
                          <button className="admin-link-button" type="submit">
                            {seller.verified ? "Pause access" : "Verify seller"}
                          </button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No sellers yet"
                message="Run web/supabase/seller-user.sql to create a seller, then assign items from the Prices tab."
              />
            )}
            <p className="admin-panel-note">
              Sellers can edit only the items assigned to them in the Prices tab. Use the Owner
              field on each item to change or remove access.
            </p>
          </section>
        ) : null}

        <p className="admin-footer-note">
          Sabeer Market · Staff workspace · Changes are published to the public price board.
        </p>
      </div>

      {pendingDelete ? (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
        >
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <span className="admin-modal-icon">
              <Icon name="trash" size={20} />
            </span>
            <h2 id="delete-title">Delete {pendingDelete.name}?</h2>
            <p>
              This permanently removes the {pendingDelete.type === "market" ? "market" : "price item"}.
              This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button
                className="button button-quiet button-small"
                type="button"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              {pendingDelete.type === "price" ? (
                <form action={deletePrice}>
                  <input type="hidden" name="id" value={pendingDelete.id} />
                  <button className="button button-danger button-small" type="submit">
                    Delete item
                  </button>
                </form>
              ) : (
                <form action={deleteMarket}>
                  <input type="hidden" name="id" value={pendingDelete.id} />
                  <button className="button button-danger button-small" type="submit">
                    Delete market
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
