"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/format";

export function CartDialog() {
  const { items, subtotal, isOpen, closeCart, increase, decrease, remove } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      className="cart-dialog"
      id="cart-dialog"
      aria-labelledby="cart-title"
      ref={dialogRef}
      onClose={closeCart}
      onClick={(event) => {
        if (event.target === dialogRef.current) closeCart();
      }}
    >
      <div className="cart-header">
        <h2 id="cart-title">Your bag</h2>
        <button className="cart-close" type="button" aria-label="Close bag" onClick={closeCart}>×</button>
      </div>

      <div className="cart-items">
        {items.length === 0 ? (
          <p className="cart-empty">Your bag is waiting for something good.</p>
        ) : (
          items.map((item) => (
            <div className="cart-item" key={item.productId}>
              <div className="cart-item-info">
                <strong>{item.name}</strong>
                <span>{formatMoney(item.price)} each</span>
              </div>
              <div className="cart-item-controls">
                <button className="qty-button" type="button" aria-label={`Remove one ${item.name}`} onClick={() => decrease(item.productId)}>−</button>
                <span className="qty-value" aria-hidden="true">{item.quantity}</span>
                <button className="qty-button" type="button" aria-label={`Add one more ${item.name}`} onClick={() => increase(item.productId)}>+</button>
                <button className="cart-remove" type="button" aria-label={`Remove ${item.name} from bag`} onClick={() => remove(item.productId)}>×</button>
              </div>
              <span className="cart-line-total">{formatMoney(item.price * item.quantity)}</span>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <p className="cart-total">Subtotal <strong>{formatMoney(subtotal)}</strong></p>
        {items.length === 0 ? (
          <button className="button button-dark checkout-button" type="button" disabled>Your bag is empty</button>
        ) : (
          <Link className="button button-dark checkout-button" href="/checkout" onClick={closeCart}>
            Checkout
          </Link>
        )}
        <p className="checkout-note">Checkout saves your order and gives you a reference number. We reply with payment and delivery details.</p>
      </div>
    </dialog>
  );
}
