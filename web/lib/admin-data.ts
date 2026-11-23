import type { AdminMarket, AdminPriceItem, AdminSeller } from "@/lib/admin-types";
import { CATEGORY_NAMES } from "@/lib/prices";
import { createClient } from "@/lib/supabase/server";

type MarketRow = {
  id: string;
  name: string;
  detail: string | null;
  sort_order: number | null;
};

type SellerRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  requested_market_id: string | null;
  note: string | null;
  verified: boolean;
  approved_at: string | null;
};

type PriceRow = {
  id: string;
  name: string;
  category: string;
  market_id: string;
  seller_id: string | null;
  unit: string;
  price: number | string;
  change: number | string;
  history: unknown;
  active: boolean;
  sort_order: number | null;
  updated_at: string | null;
};

export type AdminData = {
  markets: AdminMarket[];
  sellers: AdminSeller[];
  items: AdminPriceItem[];
  error: string | null;
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toCategory(value: unknown): AdminPriceItem["category"] {
  const category = String(value);
  return (CATEGORY_NAMES as readonly string[]).includes(category)
    ? (category as AdminPriceItem["category"])
    : "Grains";
}

export async function getAdminData(): Promise<AdminData> {
  const supabase = await createClient();

  const [marketsResult, sellersResult, itemsResult] = await Promise.all([
    supabase
      .from("markets")
      .select("id,name,detail,sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("sellers")
      .select("id,email,name,phone,requested_market_id,note,verified,approved_at")
      .order("email", { ascending: true }),
    supabase
      .from("price_items")
      .select(
        "id,name,category,market_id,seller_id,unit,price,change,history,active,sort_order,updated_at"
      )
      .order("sort_order", { ascending: true })
  ]);

  const error =
    marketsResult.error?.message ??
    sellersResult.error?.message ??
    itemsResult.error?.message ??
    null;

  const markets = ((marketsResult.data ?? []) as MarketRow[]).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    detail: String(row.detail ?? ""),
    sort_order: toNumber(row.sort_order)
  }));

  const sellers = ((sellersResult.data ?? []) as SellerRow[]).map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: String(row.name || row.email.split("@")[0] || "Seller"),
    phone: String(row.phone ?? ""),
    requestedMarketId: row.requested_market_id ? String(row.requested_market_id) : null,
    note: String(row.note ?? ""),
    verified: Boolean(row.verified),
    approvedAt: row.approved_at ?? null
  }));

  const items = ((itemsResult.data ?? []) as PriceRow[]).map((row) => {
    const price = toNumber(row.price);
    const history = Array.isArray(row.history)
      ? row.history.map((value) => toNumber(value))
      : [];

    return {
      id: String(row.id),
      name: String(row.name),
      category: toCategory(row.category),
      market_id: String(row.market_id),
      seller_id: row.seller_id ? String(row.seller_id) : null,
      unit: String(row.unit),
      price,
      change: toNumber(row.change),
      history: history.length ? history : [price],
      active: Boolean(row.active),
      sort_order: toNumber(row.sort_order),
      updated_at: row.updated_at ?? null
    };
  });

  return { markets, sellers, items, error };
}
