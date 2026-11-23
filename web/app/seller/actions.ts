"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  redirect("/seller");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/seller");
}

export async function saveOwnPrice(formData: FormData) {
  const supabase = await requireSeller();
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
