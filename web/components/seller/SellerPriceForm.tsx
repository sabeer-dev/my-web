"use client";

import { saveOwnPrice } from "@/app/seller/actions";
import { AdminSubmit } from "@/components/admin/AdminSubmit";
import type { AdminMarket, AdminPriceItem, SellerProfile } from "@/lib/admin-types";

type Props = {
  item: AdminPriceItem;
  markets: AdminMarket[];
  seller: SellerProfile;
  onCancel: () => void;
};

export function SellerPriceForm({ item, markets, seller, onCancel }: Props) {
  const marketName = markets.find((market) => market.id === item.market_id)?.name ?? item.market_id;

  return (
    <form action={saveOwnPrice} className="admin-form">
      <input type="hidden" name="id" value={item.id} />

      <div className="admin-readonly">
        <div>
          <small>Item</small>
          <strong>{item.name}</strong>
        </div>
        <div>
          <small>Market</small>
          <strong>{marketName}</strong>
        </div>
        <div>
          <small>Category</small>
          <strong>{item.category}</strong>
        </div>
        <div>
          <small>Managed by</small>
          <strong>{seller.name}</strong>
        </div>
      </div>
      <p className="admin-field-help">
        Item name, category, and market are managed by the Sabeer Market team. Contact us if any
        of those need to change.
      </p>

      <div className="admin-fields admin-fields-market">
        <label className="admin-field">
          <span>Unit</span>
          <input name="unit" defaultValue={item.unit} required placeholder="50kg bag" />
        </label>

        <label className="admin-field">
          <span>Price (₦)</span>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={item.price}
            required
          />
        </label>

        <label className="admin-field">
          <span>Change (%)</span>
          <input
            name="change"
            type="number"
            step="0.1"
            inputMode="decimal"
            defaultValue={item.change}
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
            defaultValue={item.sort_order}
          />
        </label>

        <label className="admin-field admin-field-wide">
          <span>7-day history</span>
          <input
            name="history"
            defaultValue={item.history.join(", ")}
            placeholder="70000, 72000, 73000, 75000, 74000, 76000, 78000"
          />
          <small className="admin-field-help">
            Seven comma-separated prices, oldest first. Leave blank to start from the current
            price.
          </small>
        </label>

        <label className="admin-check">
          <input name="active" type="checkbox" defaultChecked={item.active} />
          <span>Visible on the public board</span>
        </label>
      </div>

      <div className="admin-actions">
        <AdminSubmit />
        <button className="button button-quiet button-small" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
