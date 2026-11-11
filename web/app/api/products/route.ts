import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}
