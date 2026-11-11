"use client";

import { useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductGrid({ products }: { products: Product[] }) {
  const { add } = useCart();
  const [added, setAdded] = useState<number[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  function handleAdd(product: Product) {
    add({ productId: product.id, name: product.name, price: product.price, image: product.image });
    setAdded((current) => (current.includes(product.id) ? current : [...current, product.id]));

    const existing = timers.current.get(product.id);
    if (existing) clearTimeout(existing);

    timers.current.set(
      product.id,
      setTimeout(() => {
        setAdded((current) => current.filter((id) => id !== product.id));
        timers.current.delete(product.id);
      }, 1000)
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => {
        const isAdded = added.includes(product.id);
        return (
          <article className="product-card" key={product.id}>
            <div className={`product-image image-${product.image}`}>
              {product.tag ? <span className="product-tag">{product.tag}</span> : null}
              <button className="add-button" type="button" onClick={() => handleAdd(product)}>
                {isAdded ? <>Added <span aria-hidden="true">✓</span></> : <>Add to bag <span aria-hidden="true">+</span></>}
              </button>
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <span>{formatMoney(product.price)}</span>
              <p>{product.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
