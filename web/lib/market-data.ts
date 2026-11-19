import {
  CATEGORY_NAMES,
  fallbackMarkets,
  prices as fallbackPrices,
  type Market,
  type PriceItem
} from "@/lib/prices";
import { createPublicClient } from "@/lib/supabase/public";

type PriceRow = {
  id: string;
  name: string;
  category: string;
  market_id: string;
  unit: string;
  price: number | string;
  change: number | string;
  history: unknown;
  active: boolean;
  sort_order: number | null;
  markets?: { name?: string | null } | Array<{ name?: string | null }> | null;
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toCategory(value: unknown): PriceItem["category"] {
  const category = String(value);
  return (CATEGORY_NAMES as readonly string[]).includes(category)
    ? (category as PriceItem["category"])
    : "Grains";
}

function marketName(row: PriceRow) {
  const market = row.markets;
  if (Array.isArray(market)) return market[0]?.name ?? row.market_id;
  return market?.name ?? row.market_id;
}

export async function getMarkets(): Promise<Market[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackMarkets;

  try {
    const { data, error } = await supabase
      .from("markets")
      .select("id,name,detail,sort_order")
      .order("sort_order", { ascending: true });

    if (error || !data) return fallbackMarkets;

    return data.map((row) => ({
      slug: String(row.id),
      name: String(row.name),
      detail: String(row.detail ?? "")
    }));
  } catch {
    return fallbackMarkets;
  }
}

export async function getPriceItems(): Promise<PriceItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackPrices;

  try {
    const { data, error } = await supabase
      .from("price_items")
      .select(
        "id,name,category,market_id,unit,price,change,history,active,sort_order,markets(name)"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return fallbackPrices;

    return (data as PriceRow[]).map((row) => {
      const price = toNumber(row.price);
      const history = Array.isArray(row.history)
        ? row.history.map((value) => toNumber(value))
        : [];

      return {
        id: String(row.id),
        name: String(row.name),
        category: toCategory(row.category),
        market: marketName(row),
        marketId: String(row.market_id),
        unit: String(row.unit),
        price,
        change: toNumber(row.change),
        history: history.length ? history : [price]
      };
    });
  } catch {
    return fallbackPrices;
  }
}
