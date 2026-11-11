import { createClient, type Client } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL?.trim() || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

declare global {
  // Reuse one connection across hot reloads in development.
  var __sabeerDb: Client | undefined;
  var __sabeerDbReady: Promise<void> | undefined;
}

export function db(): Client {
  if (!globalThis.__sabeerDb) {
    globalThis.__sabeerDb = createClient({ url, authToken });
  }
  return globalThis.__sabeerDb;
}

const SEED_PRODUCTS = [
  {
    slug: "450w-mono-solar-panel",
    name: "450W Mono Solar Panel",
    price: 189,
    description: "High-efficiency monocrystalline",
    tag: "Bestseller",
    image: "panel"
  },
  {
    slug: "35kva-hybrid-inverter",
    name: "3.5kVA Hybrid Inverter",
    price: 549,
    description: "Pure sine wave, solar ready",
    tag: null,
    image: "inverter"
  },
  {
    slug: "200ah-deep-cycle-battery",
    name: "200Ah Deep-Cycle Battery",
    price: 299,
    description: "Maintenance-free, 1,200 cycles",
    tag: "Just in",
    image: "battery"
  },
  {
    slug: "50w-solar-floodlight",
    name: "50W Solar Floodlight",
    price: 45,
    description: "Dusk-to-dawn, weatherproof",
    tag: null,
    image: "floodlight"
  }
];

async function migrate(): Promise<void> {
  const client = db();

  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT NOT NULL,
        tag TEXT,
        image TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        note TEXT,
        subtotal INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        quantity INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC)`
    ],
    "write"
  );

  const count = await client.execute("SELECT COUNT(*) AS count FROM products");
  const existing = Number(count.rows[0]?.count ?? 0);
  if (existing > 0) return;

  for (const product of SEED_PRODUCTS) {
    await client.execute({
      sql: `INSERT INTO products (slug, name, price, description, tag, image) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [product.slug, product.name, product.price, product.description, product.tag, product.image]
    });
  }
}

export function ensureDb(): Promise<void> {
  if (!globalThis.__sabeerDbReady) {
    globalThis.__sabeerDbReady = migrate().catch((error) => {
      // Let the next request retry instead of caching a failed promise forever.
      globalThis.__sabeerDbReady = undefined;
      throw error;
    });
  }
  return globalThis.__sabeerDbReady;
}
