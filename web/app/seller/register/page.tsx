import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SellerRegister } from "@/components/seller/SellerRegister";
import type { AdminMarket } from "@/lib/admin-types";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seller registration",
  robots: { index: false, follow: false }
};

export default async function SellerRegisterPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>Connect Supabase first</h1>
          <p>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>web/.env.local</code>, then
            restart the dev server.
          </p>
          <Link className="text-link" href="/seller">
            Back to seller sign in
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) redirect("/seller");

  const { data, error } = await supabase
    .from("markets")
    .select("id,name,detail,sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>Run the database schema</h1>
          <p>Open <code>web/supabase/schema.sql</code> in the Supabase SQL Editor and run it once.</p>
          <p className="admin-error">{error.message}</p>
          <Link className="text-link" href="/seller">
            Back to seller sign in
          </Link>
        </div>
      </main>
    );
  }

  const markets: AdminMarket[] = (data ?? []).map((market) => ({
    id: String(market.id),
    name: String(market.name),
    detail: String(market.detail ?? ""),
    sort_order: Number.isFinite(Number(market.sort_order)) ? Number(market.sort_order) : 0
  }));

  return (
    <main className="admin-shell admin-auth-shell">
      <SellerRegister markets={markets} />
    </main>
  );
}
