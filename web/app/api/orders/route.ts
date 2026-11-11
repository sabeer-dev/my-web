import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createOrder, listOrders, OrderError } from "@/lib/orders";
import { parseCart, parseCustomer } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const payload = (body ?? {}) as Record<string, unknown>;
    const customer = parseCustomer(payload.customer);
    const cart = parseCart(payload.items);
    const order = await createOrder(customer, cart);
    return NextResponse.json({ reference: order.reference, subtotal: order.subtotal }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/orders failed", error);
    return NextResponse.json({ error: "Could not place the order. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  try {
    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders failed", error);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
