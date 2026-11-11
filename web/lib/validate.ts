import type { CartLine, Customer } from "./orders";
import { OrderError } from "./orders";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseCustomer(input: unknown): Customer {
  const body = (input ?? {}) as Record<string, unknown>;
  const customer: Customer = {
    name: text(body.name, 120),
    email: text(body.email, 180),
    phone: text(body.phone, 40),
    address: text(body.address, 400),
    note: text(body.note, 600)
  };

  const problems: string[] = [];
  if (customer.name.length < 2) problems.push("your name");
  if (!EMAIL.test(customer.email)) problems.push("a valid email");
  if (customer.phone.replace(/\D/g, "").length < 6) problems.push("a phone number");
  if (customer.address.length < 6) problems.push("a delivery address");

  if (problems.length > 0) {
    throw new OrderError(`Please provide ${problems.join(", ")}.`);
  }

  return customer;
}

export function parseCart(input: unknown): CartLine[] {
  if (!Array.isArray(input)) throw new OrderError("Your bag is empty.");

  const lines: CartLine[] = [];
  for (const raw of input.slice(0, 50)) {
    const item = (raw ?? {}) as Record<string, unknown>;
    const productId = Number(item.productId);
    const quantity = Math.floor(Number(item.quantity));

    if (!Number.isInteger(productId) || productId <= 0) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    lines.push({ productId, quantity: Math.min(quantity, 99) });
  }

  if (lines.length === 0) throw new OrderError("Your bag is empty.");
  return lines;
}
