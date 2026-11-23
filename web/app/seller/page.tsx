import type { Metadata } from "next";
import { SellerLogin } from "@/components/seller/SellerLogin";
import { SellerWorkspace } from "@/components/seller/SellerWorkspace";
import { getSellerData } from "@/lib/seller-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seller portal",
  robots: { index: false, follow: false }
};

type SellerPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

type Banner = {
  tone: "error" | "success";
  message: string;
};

export default async function SellerPage({ searchParams }: SellerPageProps) {
  const params = await searchParams;
  const banner: Banner | null = params.error
    ? { tone: "error", message: params.error }
    : params.saved
      ? { tone: "success", message: "Price saved." }
      : null;

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
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="admin-shell admin-auth-shell">
        <SellerLogin notice={banner?.tone === "error" ? banner.message : undefined} />
      </main>
    );
  }

  if (user.app_metadata?.role !== "seller") {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>This is the seller portal</h1>
          <p>
            You are signed in as <strong>{user.email}</strong>. Seller accounts are created by
            the Sabeer Market team with the <code>seller</code> role.
          </p>
          <form action={signOut}>
            <button className="button button-dark" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  const { seller, markets, items, error } = await getSellerData(user.id);

  if (!seller?.verified) {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>Account pending verification</h1>
          <p>
            Your seller account is not active yet. Ask the Sabeer Market team to verify it from
            the admin dashboard, then sign in again.
          </p>
          <form action={signOut}>
            <button className="button button-dark" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Sellers</p>
          <h1>Run the database schema</h1>
          <p>
            Open <code>web/supabase/schema.sql</code> in the Supabase SQL Editor and run it once.
            Then reload this page.
          </p>
          <p className="admin-error">{error}</p>
        </div>
      </main>
    );
  }

  return <SellerWorkspace seller={seller} markets={markets} items={items} banner={banner} />;
}
