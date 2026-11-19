"use client";

import { useMemo } from "react";
import { deleteMarket, deletePrice } from "@/app/admin/actions";
import type { AdminMarket, AdminPriceItem } from "@/lib/admin-types";
import { MarketForm } from "./MarketForm";
import { PriceForm } from "./PriceForm";

type Props = {
  markets: AdminMarket[];
  items: AdminPriceItem[];
};

export function AdminDashboard({ markets, items }: Props) {
  const itemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      counts.set(item.market_id, (counts.get(item.market_id) ?? 0) + 1);
    });
    return counts;
  }, [items]);

  return (
    <>
      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <p className="eyebrow">Price board</p>
            <h2>{items.length} items</h2>
          </div>
          <p className="admin-hint">
            Edit a row and save. Set <strong>Active</strong> off to hide an item from the
            public board.
          </p>
        </div>

        <details className="admin-add">
          <summary>Add a new item</summary>
          <PriceForm markets={markets} />
        </details>

        <div className="admin-list">
          {items.map((item) => (
            <article className="admin-card" key={item.id}>
              <div className="admin-card-head">
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.id} · {item.active ? "live" : "hidden"}
                  </small>
                </div>
                <form
                  action={deletePrice}
                  onSubmit={(event) => {
                    if (!window.confirm(`Delete ${item.name}?`)) event.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <button className="admin-delete" type="submit">
                    Delete
                  </button>
                </form>
              </div>
              <PriceForm markets={markets} item={item} />
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <p className="eyebrow">Coverage</p>
            <h2>{markets.length} markets</h2>
          </div>
          <p className="admin-hint">
            Market names and details appear in the price filters and market cards.
          </p>
        </div>

        <details className="admin-add">
          <summary>Add a market</summary>
          <MarketForm />
        </details>

        <div className="admin-list admin-list-markets">
          {markets.map((market) => {
            const count = itemCounts.get(market.id) ?? 0;

            return (
              <article className="admin-card" key={market.id}>
                <div className="admin-card-head">
                  <div>
                    <strong>{market.name}</strong>
                    <small>
                      {market.id} · {count} {count === 1 ? "item" : "items"}
                    </small>
                  </div>
                  <form
                    action={deleteMarket}
                    onSubmit={(event) => {
                      if (!window.confirm(`Delete ${market.name}?`)) event.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={market.id} />
                    <button className="admin-delete" type="submit" disabled={count > 0}>
                      Delete
                    </button>
                  </form>
                </div>
                <MarketForm market={market} />
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
