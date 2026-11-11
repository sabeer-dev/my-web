"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  add: (item: Omit<CartItem, "quantity">) => void;
  increase: (productId: number) => void;
  decrease: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "sabeer-solar-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      const item = (entry ?? {}) as Record<string, unknown>;
      const productId = Number(item.productId);
      const price = Number(item.price);
      const quantity = Math.floor(Number(item.quantity));
      const name = typeof item.name === "string" ? item.name : "";
      const image = typeof item.image === "string" ? item.image : "panel";

      if (!Number.isInteger(productId) || productId <= 0) return [];
      if (!Number.isFinite(price) || price <= 0) return [];
      if (!Number.isFinite(quantity) || quantity <= 0) return [];
      if (!name) return [];

      return [{ productId, name, price, image, quantity: Math.min(quantity, 99) }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage blocked - the cart still works for this visit */
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: Math.min(entry.quantity + 1, 99) }
            : entry
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }, []);

  const increase = useCallback((productId: number) => {
    setItems((current) =>
      current.map((entry) =>
        entry.productId === productId
          ? { ...entry, quantity: Math.min(entry.quantity + 1, 99) }
          : entry
      )
    );
  }, []);

  const decrease = useCallback((productId: number) => {
    setItems((current) =>
      current.flatMap((entry) => {
        if (entry.productId !== productId) return [entry];
        if (entry.quantity <= 1) return [];
        return [{ ...entry, quantity: entry.quantity - 1 }];
      })
    );
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, count, subtotal, isOpen, add, increase, decrease, remove, clear, openCart, closeCart };
  }, [items, isOpen, add, increase, decrease, remove, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
