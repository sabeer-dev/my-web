"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/seller/actions";
import { Icon } from "@/components/admin/AdminIcons";
import { money, RelativeTime } from "@/components/format";
import type { AdminMarket, AdminPriceItem, SellerProfile } from "@/lib/admin-types";
import { SellerAddForm } from "./SellerAddForm";
import { SellerPriceForm } from "./SellerPriceForm";

type Banner = { tone: "error" | "success"; message: string } | null;

type Props = {
  seller: SellerProfile;
  markets: AdminMarket[];
  items: AdminPriceItem[];
  banner: Banner;
};

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="admin-empty">
      <span className="admin-empty-icon">
        <Icon name="tag" size={20} />
      </span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export function SellerWorkspace({ seller, markets, items, banner }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    setBannerDismissed(false);
  }, [banner?.message]);

  const marketNames = useMemo(
    () => new Map(markets.map((market) => [market.id, market.name])),
    [markets]
  );

  const defaultMarketId =
    (seller.requestedMarketId && marketNames.has(seller.requestedMarketId)
      ? seller.requestedMarketId
      : null) ??
    markets[0]?.id ??
    "";
  const nextSortOrder = items.reduce((max, item) => Math.max(max, item.sort_order), 0) + 1;

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((item) => {
        const marketName = marketNames.get(item.market_id) ?? "";
        return (
          !term ||
          `${item.name} ${item.category} ${item.unit} ${marketName}`.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }, [items, search, marketNames]);

  const liveCount = items.filter((item) => item.active).length;
  const marketCount = new Set(items.map((item) => item.market_id)).size;
  const lastUpdated = items.reduce<string | null>(
    (latest, item) => (!latest || (item.updated_at ?? "") > latest ? item.updated_at : latest),
    null
  );
  const initials = seller.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">s.</span>
          <span>
            <strong>Sabeer Market</strong>
            <small>SELLER PORTAL</small>
          </span>
        </div>

        <nav className="admin-nav" aria-label="Seller sections">
          <button className="admin-nav-item is-active" type="button" aria-current="page">
            <Icon name="tag" size={17} />
            <span>My prices</span>
            <span className="admin-nav-count">{items.length}</span>
          </button>
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-note">
            <Icon name="shield" size={16} />
            <span>Verified seller</span>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">{initials || "S"}</span>
            <span className="admin-user-copy">
              <strong>{seller.name}</strong>
              <small title={seller.email}>{seller.email}</small>
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
            <p className="eyebrow">Seller portal</p>
            <h1>My prices</h1>
            <p className="admin-lede">
              Add your own products and update prices, units, and trends. Save to publish to the
              public board.
            </p>
          </div>
          <div className="admin-top-actions">
            <button
              className="button button-primary button-small"
              type="button"
              onClick={() => setAddOpen((open) => !open)}
            >
              <Icon name="plus" size={15} />
              {addOpen ? "Close form" : "Add product"}
            </button>
            <Link className="text-link" href="/" target="_blank" rel="noreferrer">
              View public site
              <Icon name="external" size={14} />
            </Link>
          </div>
        </header>

        <nav className="admin-mobile-tabs" aria-label="Seller sections">
          <button className="is-active" type="button" aria-current="page">
            <Icon name="tag" size={16} />
            My prices
          </button>
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

        <section className="admin-stats" aria-label="Your price summary">
          <article className="admin-stat">
            <span className="admin-stat-icon">
              <Icon name="package" size={18} />
            </span>
            <span className="admin-stat-label">My items</span>
            <strong className="admin-stat-value">{items.length}</strong>
            <span className="admin-stat-foot">Added by you or assigned by the team</span>
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
            <strong className="admin-stat-value">{marketCount}</strong>
            <span className="admin-stat-foot">Where your items are listed</span>
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

        <div className="admin-toolbar">
          <label className="admin-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search my items…"
              aria-label="Search my items"
            />
          </label>
        </div>

        <section className="admin-card-surface">
          <header className="admin-panel-head">
            <div>
              <p className="eyebrow">My items</p>
              <h2>
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
              </h2>
            </div>
            <span className="admin-status is-live">Verified account</span>
          </header>

          {addOpen ? (
            <div className="admin-form-panel">
              <div className="admin-form-panel-head">
                <strong>New product</strong>
                <span>Your product appears on the public board after saving.</span>
              </div>
              <SellerAddForm
                markets={markets}
                defaultMarketId={defaultMarketId}
                nextSortOrder={nextSortOrder}
                onCancel={() => setAddOpen(false)}
              />
            </div>
          ) : null}

          {filteredItems.length ? (
            <div className="admin-list">
              {filteredItems.map((item) => {
                const isEditing = editing === item.id;
                return (
                  <article className={`admin-row-wrap${isEditing ? " is-editing" : ""}`} key={item.id}>
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
                          title="Edit price"
                          onClick={() => setEditing(isEditing ? null : item.id)}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                      </div>
                    </div>
                    {isEditing ? (
                      <div className="admin-row-editor">
                        <SellerPriceForm
                          item={item}
                          markets={markets}
                          seller={seller}
                          onCancel={() => setEditing(null)}
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No products yet"
              message="Use Add product to publish your first item, or ask the Sabeer Market team to assign one."
            />
          )}
        </section>

        <p className="admin-footer-note">
          Sabeer Market · Seller portal · You can add products and edit only the items on this page.
        </p>
      </div>
    </div>
  );
}
