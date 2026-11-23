"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORY_NAMES, type PriceItem } from "@/lib/prices";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const raw = formData.get(key);
  if (raw === null || String(raw).trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function integerValue(formData: FormData, key: string, fallback = 0) {
  return Math.round(numberValue(formData, key, fallback));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseHistory(value: string, price: number) {
  const history = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((entry) => Number.isFinite(entry));

  return history.length ? history : [price];
}

function categoryValue(value: string): PriceItem["category"] {
  return (CATEGORY_NAMES as readonly string[]).includes(value)
    ? (value as PriceItem["category"])
    : "Grains";
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin?error=You%20need%20an%20admin%20account.");
  }

  return supabase;
}

export async function signIn(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function savePrice(formData: FormData) {
  const supabase = await requireAdmin();
  const name = text(formData, "name");

  if (!name) redirect("/admin?error=Item%20name%20is%20required.");

  const existingId = text(formData, "id");
  const id = existingId || slugify(name) || `item-${Date.now()}`;
  const marketId = text(formData, "market_id");
  const sellerId = text(formData, "seller_id") || null;

  if (!marketId) redirect("/admin?error=Choose%20a%20market.");

  if (sellerId) {
    const { data: seller } = await supabase
      .from("sellers")
      .select("id")
      .eq("id", sellerId)
      .eq("verified", true)
      .maybeSingle();

    if (!seller) redirect("/admin?error=Choose%20a%20verified%20seller.");
  }

  const price = Math.max(0, integerValue(formData, "price"));
  const payload = {
    id,
    name,
    category: categoryValue(text(formData, "category")),
    market_id: marketId,
    seller_id: sellerId,
    unit: text(formData, "unit") || "1 unit",
    price,
    change: numberValue(formData, "change"),
    history: parseHistory(text(formData, "history"), price),
    active: formData.get("active") === "on",
    sort_order: integerValue(formData, "sort_order")
  };

  const { error } = existingId
    ? await supabase.from("price_items").update(payload).eq("id", existingId)
    : await supabase.from("price_items").insert(payload);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=price");
}

export async function deletePrice(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, "id");

  if (!id) redirect("/admin?error=Missing%20item.");

  const { error } = await supabase.from("price_items").delete().eq("id", id);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=deleted");
}

export async function saveMarket(formData: FormData) {
  const supabase = await requireAdmin();
  const name = text(formData, "name");

  if (!name) redirect("/admin?error=Market%20name%20is%20required.");

  const existingId = text(formData, "id");
  const id = existingId || slugify(name) || `market-${Date.now()}`;
  const payload = {
    id,
    name,
    detail: text(formData, "detail"),
    sort_order: integerValue(formData, "sort_order")
  };

  const { error } = existingId
    ? await supabase.from("markets").update(payload).eq("id", existingId)
    : await supabase.from("markets").insert(payload);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=market");
}

export async function deleteMarket(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, "id");

  if (!id) redirect("/admin?error=Missing%20market.");

  const { error } = await supabase.from("markets").delete().eq("id", id);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=market-deleted");
}

export async function setSellerVerified(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, "id");

  if (!id) redirect("/admin?error=Missing%20seller.");

  const verified = formData.get("verified") === "true";
  const { error } = await supabase
    .from("sellers")
    .update(verified ? { verified, approved_at: new Date().toISOString() } : { verified })
    .eq("id", id);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/seller");
  redirect(verified ? "/admin?saved=seller-verified" : "/admin?saved=seller-unverified");
}
