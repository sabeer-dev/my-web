import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ORDER_STATUSES, OrderError, updateOrderStatus, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const status = (body as Record<string, unknown> | null)?.status;
  if (typeof status !== "string" || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }

  try {
    await updateOrderStatus(orderId, status as OrderStatus);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/orders/[id]/status failed", error);
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
}
