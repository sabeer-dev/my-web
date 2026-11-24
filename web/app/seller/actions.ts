"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORY_NAMES } from "@/lib/prices";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export type RegisterState = {
  error?: string;
  success?: string;
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

function categoryValue(value: string) {
  return (CATEGORY_NAMES as readonly string[]).includes(value)
    ? (value as (typeof CATEGORY_NAMES)[number])
    : "Grains";
}

function parseHistory(value: string, price: number) {
  const history = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((entry) => Number.isFinite(entry));

  return history.length ? history : [price];
}

async function requireSeller() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "seller") {
    redirect("/seller?error=You%20need%20a%20seller%20account.");
  }

  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("id", user.id)
    .eq("verified", true)
    .maybeSingle();

  if (!seller) {
    redirect("/seller?error=Your%20seller%20account%20is%20not%20verified%20yet.");
  }

  return { supabase, user };
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

  redirect("/seller");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/seller");
}

export async function registerSeller(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const requestedMarketId = text(formData, "market");
  const note = text(formData, "note");
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        requested_market_id: requestedMarketId,
        note,
        requested_role: "seller"
      }
    }
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");

  return {
    success: data.session
      ? "Registration received. Your account is pending verification before you can edit prices."
      : "Registration received. Check your email to confirm your address, then wait for verification."
  };
}

export async function saveOwnPrice(formData: FormData) {
  const { supabase } = await requireSeller();
  const id = text(formData, "id");

  if (!id) redirect("/seller?error=Missing%20item.");

  const price = Math.max(0, integerValue(formData, "price"));
  const payload = {
    unit: text(formData, "unit") || "1 unit",
    price,
    change: numberValue(formData, "change"),
    history: parseHistory(text(formData, "history"), price),
    active: formData.get("active") === "on",
    sort_order: integerValue(formData, "sort_order")
  };

  // RLS also restricts this update to the signed-in seller's own items.
  const { data, error } = await supabase
    .from("price_items")
    .update(payload)
    .eq("id", id)
    .select("id");

  if (error) redirect(`/seller?error=${encodeURIComponent(error.message)}`);
  if (!data?.length) redirect("/seller?error=You%20do%20not%20manage%20that%20item.");

  revalidatePath("/");
  revalidatePath("/seller");
  redirect("/seller?saved=price");
}

export async function addOwnPrice(formData: FormData) {
  const { supabase, user } = await requireSeller();
  const name = text(formData, "name");

  if (!name) redirect("/seller?error=Product%20name%20is%20required.");

  const marketId = text(formData, "market_id");
  if (!marketId) redirect("/seller?error=Choose%20a%20market.");

  const { data: market } = await supabase
    .from("markets")
    .select("id")
    .eq("id", marketId)
    .maybeSingle();
  if (!market) redirect("/seller?error=Choose%20a%20valid%20market.");

  const price = Math.max(0, integerValue(formData, "price"));
  const change = Math.max(-999.9, Math.min(999.9, numberValue(formData, "change")));
  const id = `seller-${slugify(name) || "item"}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const payload = {
    id,
    name,
    category: categoryValue(text(formData, "category")),
    market_id: marketId,
    seller_id: user.id,
    unit: text(formData, "unit") || "1 unit",
    price,
    change,
    history: parseHistory(text(formData, "history"), price),
    active: formData.get("active") === "on",
    sort_order: integerValue(formData, "sort_order")
  };

  // RLS requires the row to belong to the verified seller creating it.
  const { error } = await supabase.from("price_items").insert(payload);

  if (error) redirect(`/seller?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/seller");
  redirect("/seller?saved=created");
}
