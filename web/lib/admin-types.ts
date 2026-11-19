import type { PriceItem } from "@/lib/prices";

export type AdminMarket = {
  id: string;
  name: string;
  detail: string;
  sort_order: number;
};

export type AdminPriceItem = {
  id: string;
  name: string;
  category: PriceItem["category"];
  market_id: string;
  unit: string;
  price: number;
  change: number;
  history: number[];
  active: boolean;
  sort_order: number;
  updated_at: string | null;
};
