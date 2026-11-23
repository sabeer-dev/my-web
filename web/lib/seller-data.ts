import type { AdminMarket, AdminPriceItem, SellerProfile } from "@/lib/admin-types";
import { CATEGORY_NAMES } from "@/lib/prices";
import { createClient } from "@/lib/supabase/server";

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

type MarketRow = {
  id: string;
  name: string;
  detail: string | null;
  sort_order: number | null;
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

export type SellerData = {
  seller: SellerProfile | null;
  markets: AdminMarket[];
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

export async function getSellerData(userId: string): Promise<SellerData> {
  const supabase = await createClient();

  const [sellerResult, marketsResult, itemsResult] = await Promise.all([
    supabase
      .from("sellers")
      .select("id,email,name,phone,requested_market_id,note,verified,approved_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("markets")
      .select("id,name,detail,sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("price_items")
      .select(
        "id,name,category,market_id,seller_id,unit,price,change,history,active,sort_order,updated_at"
      )
      .eq("seller_id", userId)
      .order("sort_order", { ascending: true })
  ]);

  const error =
    sellerResult.error?.message ??
    marketsResult.error?.message ??
    itemsResult.error?.message ??
    null;

  const row = sellerResult.data as SellerRow | null;
  const seller = row
    ? {
        id: String(row.id),
        email: String(row.email),
        name: String(row.name || row.email.split("@")[0] || "Seller"),
        phone: String(row.phone ?? ""),
        requestedMarketId: row.requested_market_id ? String(row.requested_market_id) : null,
        note: String(row.note ?? ""),
        verified: Boolean(row.verified),
        approvedAt: row.approved_at ?? null
      }
    : null;

  const markets = ((marketsResult.data ?? []) as MarketRow[]).map((market) => ({
    id: String(market.id),
    name: String(market.name),
    detail: String(market.detail ?? ""),
    sort_order: toNumber(market.sort_order)
  }));

  const items = ((itemsResult.data ?? []) as PriceRow[]).map((item) => {
    const price = toNumber(item.price);
    const history = Array.isArray(item.history)
      ? item.history.map((value) => toNumber(value))
      : [];

    return {
      id: String(item.id),
      name: String(item.name),
      category: toCategory(item.category),
      market_id: String(item.market_id),
      seller_id: item.seller_id ? String(item.seller_id) : null,
      unit: String(item.unit),
      price,
      change: toNumber(item.change),
      history: history.length ? history : [price],
      active: Boolean(item.active),
      sort_order: toNumber(item.sort_order),
      updated_at: item.updated_at ?? null
    };
  });

  return { seller, markets, items, error };
}
