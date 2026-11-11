import { randomBytes } from "node:crypto";
import { db, ensureDb } from "./db";
import { getProductsByIds } from "./products";

export const ORDER_STATUSES = ["new", "confirmed", "fulfilled", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
};

export type CartLine = {
  productId: number;
  quantity: number;
};

export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: number;
  reference: string;
  customer: Customer;
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function makeReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createOrder(customer: Customer, cart: CartLine[]): Promise<Order> {
  if (cart.length === 0) throw new OrderError("Your bag is empty.");

  await ensureDb();
  const products = await getProductsByIds([...new Set(cart.map((line) => line.productId))]);
  const byId = new Map(products.map((product) => [product.id, product]));

  const items: OrderItem[] = cart.map((line) => {
    const product = byId.get(line.productId);
    if (!product) {
      throw new OrderError(`A product in your bag is no longer available. Please refresh and try again.`);
    }
    return { name: product.name, price: product.price, quantity: line.quantity };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const reference = makeReference();

  const tx = await db().transaction("write");
  try {
    const inserted = await tx.execute({
      sql: `INSERT INTO orders (reference, customer_name, email, phone, address, note, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [reference, customer.name, customer.email, customer.phone, customer.address, customer.note, subtotal]
    });

    const orderId = Number(inserted.lastInsertRowid);

    for (const item of items) {
      await tx.execute({
        sql: `INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)`,
        args: [orderId, null, item.name, item.price, item.quantity]
      });
    }

    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  }

  const order = await getOrderByReference(reference);
  if (!order) throw new OrderError("Order was created but could not be read back.", 500);
  return order;
}

type OrderRow = {
  id: number;
  reference: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  note: string | null;
  subtotal: number;
  status: string;
  created_at: string;
};

type ItemRow = {
  order_id: number;
  name: string;
  price: number;
  quantity: number;
};

function toOrder(row: OrderRow, items: ItemRow[]): Order {
  return {
    id: Number(row.id),
    reference: String(row.reference),
    customer: {
      name: String(row.customer_name),
      email: String(row.email),
      phone: String(row.phone),
      address: String(row.address),
      note: row.note === null ? "" : String(row.note)
    },
    subtotal: Number(row.subtotal),
    status: row.status as OrderStatus,
    createdAt: String(row.created_at),
    items: items.map((item) => ({
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }))
  };
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  await ensureDb();
  const result = await db().execute({
    sql: `SELECT id, reference, customer_name, email, phone, address, note, subtotal, status, created_at
            FROM orders WHERE reference = ?`,
    args: [reference]
  });

  const row = result.rows[0] as unknown as OrderRow | undefined;
  if (!row) return null;

  const items = await db().execute({
    sql: `SELECT order_id, name, price, quantity FROM order_items WHERE order_id = ?`,
    args: [row.id]
  });

  return toOrder(row, items.rows as unknown as ItemRow[]);
}

export async function listOrders(limit = 100): Promise<Order[]> {
  await ensureDb();
  const orders = await db().execute({
    sql: `SELECT id, reference, customer_name, email, phone, address, note, subtotal, status, created_at
            FROM orders ORDER BY id DESC LIMIT ?`,
    args: [limit]
  });

  const rows = orders.rows as unknown as OrderRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => Number(row.id));
  const placeholders = ids.map(() => "?").join(", ");
  const items = await db().execute({
    sql: `SELECT order_id, name, price, quantity FROM order_items WHERE order_id IN (${placeholders})`,
    args: ids
  });

  const itemsByOrder = new Map<number, ItemRow[]>();
  for (const item of items.rows as unknown as ItemRow[]) {
    const list = itemsByOrder.get(Number(item.order_id)) ?? [];
    list.push(item);
    itemsByOrder.set(Number(item.order_id), list);
  }

  return rows.map((row) => toOrder(row, itemsByOrder.get(Number(row.id)) ?? []));
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  if (!ORDER_STATUSES.includes(status)) throw new OrderError("Unknown status.");
  await ensureDb();
  await db().execute({
    sql: `UPDATE orders SET status = ? WHERE id = ?`,
    args: [status, id]
  });
}
