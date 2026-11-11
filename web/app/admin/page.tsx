import type { Metadata } from "next";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminOrders } from "@/components/AdminOrders";
import { isAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="admin-page section-pad">
        <AdminLogin />
      </main>
    );
  }

  const orders = await listOrders();

  return (
    <main className="admin-page section-pad">
      <div className="admin-head">
        <p className="eyebrow">Sabeer Solar</p>
        <h1>Orders</h1>
      </div>
      <AdminOrders orders={orders} />
    </main>
  );
}
