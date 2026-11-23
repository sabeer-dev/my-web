import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
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
  if (value === "price") return "Price saved. The public board will refresh shortly.";
  if (value === "deleted") return "Price item deleted.";
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
      <main className="admin-shell admin-auth-shell">
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

  if (error) {
    return (
      <main className="admin-shell">
        <div className="admin-setup">
          <p className="eyebrow">Sabeer Market · Staff</p>
          <h1>Run the database schema</h1>
          <p>
            Open <code>web/supabase/schema.sql</code> in the Supabase SQL Editor and
            run it once. Then reload this page.
          </p>
          <p className="admin-error">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <AdminWorkspace
      markets={markets}
      items={items}
      email={user.email ?? "admin@sabeermarket.ng"}
      banner={banner}
    />
  );
}
