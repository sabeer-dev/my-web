export type PriceItem = {
  id: string;
  name: string;
  category: "Grains" | "Vegetables" | "Proteins" | "Oils & spices";
  market: string;
  unit: string;
  price: number;
  change: number;
  history: number[];
};

export const CATEGORY_KEYS: Record<PriceItem["category"], string> = {
  Grains: "grains",
  Vegetables: "vegetables",
  Proteins: "proteins",
  "Oils & spices": "oils"
};

export const MARKET_KEYS = ["lagos", "abuja", "kano", "kaduna", "port-harcourt", "ibadan"] as const;
export const CATEGORY_VALUES = ["grains", "vegetables", "proteins", "oils"] as const;

export const marketOptions = [
  { value: "all", label: "All markets" },
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja" },
  { value: "kano", label: "Kano" },
  { value: "kaduna", label: "Kaduna" },
  { value: "port-harcourt", label: "Port Harcourt" },
  { value: "ibadan", label: "Ibadan" }
];

export const categoryOptions = [
  { value: "all", label: "All items" },
  { value: "grains", label: "Grains" },
  { value: "vegetables", label: "Vegetables" },
  { value: "proteins", label: "Proteins" },
  { value: "oils", label: "Oils & spices" }
];

export const prices: PriceItem[] = [
  { id: "rice", name: "Local Rice", category: "Grains", market: "Lagos", unit: "50kg bag", price: 78000, change: 2.4, history: [70000, 72000, 73000, 75000, 74000, 76000, 78000] },
  { id: "beans", name: "Honey Beans", category: "Grains", market: "Kano", unit: "50kg bag", price: 65000, change: -1.2, history: [68000, 67000, 66000, 67000, 65000, 66000, 65000] },
  { id: "maize", name: "Maize", category: "Grains", market: "Abuja", unit: "100kg bag", price: 52000, change: 1.8, history: [48000, 49000, 50000, 51000, 50000, 51000, 52000] },
  { id: "garri", name: "Garri", category: "Grains", market: "Ibadan", unit: "50kg bag", price: 38000, change: -2, history: [40000, 40000, 39000, 39000, 38000, 39000, 38000] },
  { id: "tomatoes", name: "Tomatoes", category: "Vegetables", market: "Lagos", unit: "Big basket", price: 32000, change: 8.6, history: [24000, 26000, 25000, 28000, 29000, 30000, 32000] },
  { id: "onions", name: "Onions", category: "Vegetables", market: "Kaduna", unit: "50kg bag", price: 45000, change: -3.1, history: [48000, 47000, 47000, 46000, 46000, 45000, 45000] },
  { id: "pepper", name: "Rodo Pepper", category: "Vegetables", market: "Lagos", unit: "50kg bag", price: 48000, change: 4.2, history: [42000, 44000, 43000, 45000, 46000, 47000, 48000] },
  { id: "yam", name: "Yam", category: "Vegetables", market: "Abuja", unit: "100 tubers", price: 85000, change: 5, history: [76000, 78000, 79000, 81000, 82000, 84000, 85000] },
  { id: "eggs", name: "Eggs", category: "Proteins", market: "Abuja", unit: "Crate of 30", price: 5200, change: 0, history: [5200, 5200, 5100, 5200, 5200, 5200, 5200] },
  { id: "chicken", name: "Chicken", category: "Proteins", market: "Lagos", unit: "1kg", price: 6500, change: 1.5, history: [6000, 6100, 6200, 6300, 6400, 6400, 6500] },
  { id: "palm-oil", name: "Palm Oil", category: "Oils & spices", market: "Port Harcourt", unit: "25L keg", price: 38000, change: -0.9, history: [39000, 39000, 38000, 38000, 39000, 38000, 38000] },
  { id: "cooking-oil", name: "Cooking Oil", category: "Oils & spices", market: "Lagos", unit: "5L bottle", price: 12500, change: 0, history: [12500, 12600, 12500, 12500, 12400, 12500, 12500] }
];

export const WATCHLIST_KEY = "sabeer-market-watchlist-v1";

export function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function money(value: number) {
  return "₦" + Number(value).toLocaleString("en-NG");
}

export function changeClass(change: number) {
  if (change > 0) return "is-up";
  if (change < 0) return "is-down";
  return "is-flat";
}

export function changeLabel(change: number) {
  if (change > 0) return `↑ ${change.toFixed(1)}%`;
  if (change < 0) return `↓ ${Math.abs(change).toFixed(1)}%`;
  return "→ 0.0%";
}

export function sparkBars(history: number[]) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  return history.map((value) => Math.round(17 + ((value - min) / range) * 83));
}
