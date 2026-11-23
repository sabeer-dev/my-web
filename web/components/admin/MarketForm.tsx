"use client";

import { saveMarket } from "@/app/admin/actions";
import type { AdminMarket } from "@/lib/admin-types";
import { AdminSubmit } from "./AdminSubmit";

type Props = {
  market?: AdminMarket;
  onCancel?: () => void;
};

export function MarketForm({ market, onCancel }: Props) {
  return (
    <form action={saveMarket} className="admin-form">
      {market ? <input type="hidden" name="id" value={market.id} /> : null}

      <div className="admin-fields admin-fields-market">
        <label className="admin-field admin-field-name">
          <span>Market name</span>
          <input
            name="name"
            defaultValue={market?.name ?? ""}
            required
            placeholder="e.g. Lagos"
          />
        </label>

        <label className="admin-field admin-field-wide">
          <span>Market detail</span>
          <input
            name="detail"
            defaultValue={market?.detail ?? ""}
            placeholder="Mile 12 · Oshodi · Ikeja"
          />
          <small className="admin-field-help">
            Shown under the market name on the public site.
          </small>
        </label>

        <label className="admin-field">
          <span>Sort order</span>
          <input
            name="sort_order"
            type="number"
            step="1"
            inputMode="numeric"
            defaultValue={market?.sort_order ?? 0}
          />
        </label>
      </div>

      <div className="admin-actions">
        <AdminSubmit label={market ? "Save market" : "Add market"} />
        {onCancel ? (
          <button className="button button-quiet button-small" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
