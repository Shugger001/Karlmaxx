import { finalizePaystackPayment } from "@/lib/payments/paystack.server";
import { getPaymentProviderId } from "@/lib/payments/provider";
import type { CartItem } from "@/types";
import { NextResponse } from "next/server";

type VerifyBody = {
  reference?: string;
  items?: CartItem[];
  userId?: string | null;
  /** Paystack customer email — stored for order tracking lookup. */
  customerEmail?: string | null;
};

export async function POST(request: Request) {
  const provider = getPaymentProviderId();
  if (provider !== "paystack") {
    return NextResponse.json(
      { ok: false, error: `Payment verify route unavailable for provider: ${provider}` },
      { status: 400 },
    );
  }

  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const reference = body.reference?.trim();
  const items = body.items;
  if (!reference || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "reference and items are required" },
      { status: 400 },
    );
  }

  try {
    const saved = await finalizePaystackPayment({
      reference,
      items,
      userId: body.userId ?? null,
      customerEmail: body.customerEmail?.trim() || null,
    });
    return NextResponse.json({
      ok: true,
      orderId: saved.orderId,
      trackingToken: saved.trackingToken || undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Order failed";
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }
}
