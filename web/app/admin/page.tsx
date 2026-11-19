import type { Metadata } from "next";
import Link from "next/link";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAdminData } from "@/lib/admin-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Price manager",
  robots: { index: false, follow: false }
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

type Banner = {
  tone: "error" | "success";
  message: string;
};

function savedMessage(value: string) {
  if (value === "price") return "Price saved. The public board will refresh.";
  if (value === "deleted") return "Item deleted.";
  if (value === "market") return "Market saved.";
  if (value === "market-deleted") return "Market deleted.";
  return "Saved.";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const banner: Banner | null = params.error
    ? { tone: "error", message: params.error }
    : params.saved
      ? { tone: "success", message: savedMessage(params.saved) }
      : null;

  if (!hasSupabaseEnv()) {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Staff</p>
          <h1>Connect Supabase first</h1>
          <p>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to{" "}
            <code>web/.env.local</code>, then restart the dev server.
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
      <main className="admin-shell">
        <AdminLogin notice={banner?.tone === "error" ? banner.message : undefined} />
      </main>
    );
  }

  if (user.app_metadata?.role !== "admin") {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Staff</p>
          <h1>This account is not an admin</h1>
          <p>
            You are signed in as <strong>{user.email}</strong>. Add{" "}
            <code>{'{"role":"admin"}'}</code> to this user&apos;s App Metadata in
            Supabase, then sign out and sign in again.
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

  const { markets, items, error } = await getAdminData();

  return (
    <main className="admin-shell">
      <div className="admin-top">
        <div>
          <p className="eyebrow">Sabeer Market · Staff</p>
          <h1>Price manager</h1>
          <p className="admin-lede">
            Signed in as {user.email}. Changes go live on the public price board.
          </p>
        </div>
        <div className="admin-top-actions">
          <Link className="text-link" href="/" target="_blank" rel="noreferrer">
            View public site ↗
          </Link>
          <form action={signOut}>
            <button className="button button-dark button-small" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {banner ? (
        <p className={`admin-banner is-${banner.tone}`}>{banner.message}</p>
      ) : null}

      {error ? (
        <div className="admin-setup">
          <h2>Run the database schema</h2>
          <p>
            Open <code>web/supabase/schema.sql</code> in the Supabase SQL Editor and
            run it once. Then reload this page.
          </p>
          <p className="admin-error">{error}</p>
        </div>
      ) : (
        <AdminDashboard markets={markets} items={items} />
      )}
    </main>
  );
}
