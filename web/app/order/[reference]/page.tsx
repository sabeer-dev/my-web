import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { getOrderByReference } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);
  if (!order) notFound();

  return (
    <main className="order-page section-pad">
      <div className="order-card">
        <p className="eyebrow">Order received</p>
        <h1>Thank you, {order.customer.name.split(" ")[0]}.</h1>
        <p className="order-lede">
          Your order <strong>{order.reference}</strong> is saved. We will contact you at {order.customer.email} with the
          final total and delivery details.
        </p>

        <ul className="order-lines">
          {order.items.map((item) => (
            <li key={`${item.name}-${item.price}`}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatMoney(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <p className="order-total">Subtotal <strong>{formatMoney(order.subtotal)}</strong></p>

        <div className="order-meta">
          <div><span>Delivering to</span><p>{order.customer.address}</p></div>
          <div><span>Phone</span><p>{order.customer.phone}</p></div>
          {order.customer.note ? <div><span>Your note</span><p>{order.customer.note}</p></div> : null}
        </div>

        <Link className="button button-dark" href="/#shop">Continue shopping</Link>
      </div>
    </main>
  );
}
