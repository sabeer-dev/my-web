"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/format";

type Status = "idle" | "saving" | "error";

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0 || status === "saving") return;

    const data = new FormData(event.currentTarget);
    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: data.get("name"),
            email: data.get("email"),
            phone: data.get("phone"),
            address: data.get("address"),
            note: data.get("note")
          },
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { reference?: string; error?: string };

      if (!response.ok || !payload.reference) {
        setError(payload.error ?? "Could not place the order. Please try again.");
        setStatus("error");
        return;
      }

      clear();
      router.push(`/order/${payload.reference}`);
    } catch {
      setError("Network problem — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h1>Your bag is empty</h1>
        <p>Add something from the shop and come back to check out.</p>
        <Link className="button button-dark" href="/#shop">Back to the shop</Link>
      </div>
    );
  }

  return (
    <div className="checkout-grid">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h1>Checkout</h1>
        <p className="checkout-lede">No payment is taken here. We save your order, contact you with the total and delivery details, then arrange payment.</p>

        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required minLength={2} />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={6} />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="address">Delivery address</label>
          <textarea id="address" name="address" rows={3} autoComplete="street-address" required minLength={6} />
        </div>

        <div className="form-field">
          <label htmlFor="note">Note (optional)</label>
          <textarea id="note" name="note" rows={2} placeholder="Installation needed, preferred delivery time, etc." />
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <button className="button button-dark checkout-submit" type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Placing order…" : "Place order"}
        </button>
      </form>

      <aside className="checkout-summary">
        <h2>Your order</h2>
        <ul>
          {items.map((item) => (
            <li key={item.productId}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatMoney(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="checkout-total">Subtotal <strong>{formatMoney(subtotal)}</strong></p>
        <Link className="text-link" href="/#shop">Keep shopping</Link>
      </aside>
    </div>
  );
}
