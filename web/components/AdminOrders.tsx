"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/orders";

function StatusControl({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);

  async function update(next: OrderStatus) {
    setStatus(next);
    setSaving(true);
    await fetch(`/api/orders/${order.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next })
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      className="status-select"
      value={status}
      disabled={saving}
      onChange={(event) => update(event.target.value as OrderStatus)}
      aria-label={`Status for ${order.reference}`}
    >
      {ORDER_STATUSES.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

export function AdminOrders({ orders }: { orders: Order[] }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="admin-empty">
        <p>No orders yet. They will appear here the moment someone checks out.</p>
        <button className="text-link" type="button" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.subtotal, 0);

  return (
    <>
      <div className="admin-bar">
        <p><strong>{orders.length}</strong> order{orders.length === 1 ? "" : "s"} · <strong>{formatMoney(revenue)}</strong> booked</p>
        <button className="text-link" type="button" onClick={signOut}>Sign out</button>
      </div>

      <div className="admin-orders">
        {orders.map((order) => (
          <article className="admin-order" key={order.id}>
            <header>
              <div>
                <strong>{order.reference}</strong>
                <span className="admin-date">{new Date(order.createdAt + "Z").toLocaleString("en-GB")}</span>
              </div>
              <StatusControl order={order} />
            </header>

            <div className="admin-customer">
              <p>{order.customer.name}</p>
              <p><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a> · <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></p>
              <p>{order.customer.address}</p>
              {order.customer.note ? <p className="admin-note">“{order.customer.note}”</p> : null}
            </div>

            <ul className="admin-lines">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.name}`}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatMoney(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="admin-total">Subtotal <strong>{formatMoney(order.subtotal)}</strong></p>
          </article>
        ))}
      </div>
    </>
  );
}
