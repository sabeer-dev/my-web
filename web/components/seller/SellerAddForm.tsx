"use client";

import { addOwnPrice } from "@/app/seller/actions";
import { AdminSubmit } from "@/components/admin/AdminSubmit";
import type { AdminMarket } from "@/lib/admin-types";
import { CATEGORY_NAMES } from "@/lib/prices";

type Props = {
  markets: AdminMarket[];
  defaultMarketId: string;
  nextSortOrder: number;
  onCancel: () => void;
};

export function SellerAddForm({ markets, defaultMarketId, nextSortOrder, onCancel }: Props) {
  return (
    <form action={addOwnPrice} className="admin-form">
      <div className="admin-fields">
        <label className="admin-field admin-field-name">
          <span>Product name</span>
          <input name="name" required placeholder="e.g. Smoked Catfish" />
        </label>

        <label className="admin-field">
          <span>Category</span>
          <select name="category" defaultValue="Grains">
            {CATEGORY_NAMES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Market</span>
          <select name="market_id" defaultValue={defaultMarketId}>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Unit</span>
          <input name="unit" required placeholder="1kg" />
        </label>

        <label className="admin-field">
          <span>Price (₦)</span>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            required
            placeholder="12000"
          />
        </label>

        <label className="admin-field">
          <span>Change (%)</span>
          <input name="change" type="number" step="0.1" inputMode="decimal" defaultValue="0" />
        </label>

        <label className="admin-field">
          <span>Sort order</span>
          <input
            name="sort_order"
            type="number"
            step="1"
            inputMode="numeric"
            defaultValue={nextSortOrder}
          />
        </label>

        <label className="admin-field admin-field-wide">
          <span>7-day history</span>
          <input
            name="history"
            placeholder="11000, 11500, 12000, 11800, 12000, 12100, 12000"
          />
          <small className="admin-field-help">
            Seven comma-separated prices, oldest first. Leave blank to start from the current
            price.
          </small>
        </label>

        <label className="admin-check">
          <input name="active" type="checkbox" defaultChecked />
          <span>Visible on the public board</span>
        </label>
      </div>

      <div className="admin-actions">
        <AdminSubmit label="Add product" pendingLabel="Adding…" />
        <button className="button button-quiet button-small" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
