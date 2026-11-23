"use client";

import { savePrice } from "@/app/admin/actions";
import type { AdminMarket, AdminPriceItem, AdminSeller } from "@/lib/admin-types";
import { CATEGORY_NAMES } from "@/lib/prices";
import { AdminSubmit } from "./AdminSubmit";

type Props = {
  markets: AdminMarket[];
  sellers: AdminSeller[];
  item?: AdminPriceItem;
  onCancel?: () => void;
};

export function PriceForm({ markets, sellers, item, onCancel }: Props) {
  return (
    <form action={savePrice} className="admin-form">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="admin-fields">
        <label className="admin-field admin-field-name">
          <span>Item name</span>
          <input
            name="name"
            defaultValue={item?.name ?? ""}
            required
            placeholder="e.g. Local Rice"
          />
        </label>

        <label className="admin-field">
          <span>Category</span>
          <select name="category" defaultValue={item?.category ?? "Grains"}>
            {CATEGORY_NAMES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Market</span>
          <select
            name="market_id"
            defaultValue={item?.market_id ?? markets[0]?.id ?? ""}
            required
          >
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Owner (seller)</span>
          <select name="seller_id" defaultValue={item?.seller_id ?? ""}>
            <option value="">Unassigned</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name} · {seller.email}
                {seller.verified ? "" : " (unverified)"}
              </option>
            ))}
          </select>
          <small className="admin-field-help">
            Only the assigned seller can edit this item.
          </small>
        </label>

        <label className="admin-field">
          <span>Unit</span>
          <input name="unit" defaultValue={item?.unit ?? ""} required placeholder="50kg bag" />
        </label>

        <label className="admin-field">
          <span>Price (₦)</span>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={item?.price ?? ""}
            required
            placeholder="78000"
          />
        </label>

        <label className="admin-field">
          <span>Change (%)</span>
          <input
            name="change"
            type="number"
            step="0.1"
            inputMode="decimal"
            defaultValue={item?.change ?? 0}
            placeholder="2.4"
          />
        </label>

        <label className="admin-field">
          <span>Sort order</span>
          <input
            name="sort_order"
            type="number"
            step="1"
            inputMode="numeric"
            defaultValue={item?.sort_order ?? 0}
          />
        </label>

        <label className="admin-field admin-field-wide">
          <span>7-day history</span>
          <input
            name="history"
            defaultValue={item?.history.join(", ") ?? ""}
            placeholder="70000, 72000, 73000, 75000, 74000, 76000, 78000"
          />
          <small className="admin-field-help">
            Seven comma-separated prices, oldest first. Leave blank to start from the current price.
          </small>
        </label>

        <label className="admin-check">
          <input name="active" type="checkbox" defaultChecked={item ? item.active : true} />
          <span>Visible on the public board</span>
        </label>
      </div>

      <div className="admin-actions">
        <AdminSubmit />
        {onCancel ? (
          <button className="button button-quiet button-small" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        {item?.updated_at ? (
          <span className="admin-updated">
            Last updated{" "}
            {new Date(item.updated_at).toLocaleDateString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: "UTC"
            })}
          </span>
        ) : null}
      </div>
    </form>
  );
}
