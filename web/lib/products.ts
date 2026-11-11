import { db, ensureDb } from "./db";

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  description: string;
  tag: string | null;
  image: string;
};

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  price: number;
  description: string;
  tag: string | null;
  image: string;
};

function toProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    price: Number(row.price),
    description: String(row.description),
    tag: row.tag === null ? null : String(row.tag),
    image: String(row.image)
  };
}

export async function getActiveProducts(): Promise<Product[]> {
  await ensureDb();
  const result = await db().execute(
    `SELECT id, slug, name, price, description, tag, image
       FROM products
      WHERE active = 1
      ORDER BY id`
  );
  return result.rows.map((row) => toProduct(row as unknown as ProductRow));
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  await ensureDb();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await db().execute({
    sql: `SELECT id, slug, name, price, description, tag, image
            FROM products
           WHERE active = 1 AND id IN (${placeholders})`,
    args: ids
  });
  return result.rows.map((row) => toProduct(row as unknown as ProductRow));
}
