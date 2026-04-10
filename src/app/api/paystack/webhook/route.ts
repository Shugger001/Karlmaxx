import { finalizePaystackPayment, verifyPaystackWebhookSignature } from "@/lib/payments/paystack.server";
import { getPaymentProviderId } from "@/lib/payments/provider";
import type { CartItem } from "@/types";
import { NextResponse } from "next/server";

type PaystackWebhookBody = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    customer?: { email?: string | null };
    metadata?: Record<string, unknown> | null;
  };
};

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const colorOk = o.color === undefined || typeof o.color === "string";
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.quantity === "number" &&
    typeof o.image === "string" &&
    colorOk
  );
}

function parseMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const raw = metadata?.[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function parseMetadataItems(metadata: Record<string, unknown> | null | undefined): CartItem[] | null {
  const topLevel = metadata?.kmxCartItems;
  if (Array.isArray(topLevel) && topLevel.every(isCartItem)) return topLevel;

  const custom = metadata?.custom_fields;
  if (!Array.isArray(custom)) return null;

  const row = custom.find((v) => {
    if (!v || typeof v !== "object") return false;
    const variable = (v as Record<string, unknown>).variable_name;
    return variable === "kmx_cart_items_json";
  });
  if (!row || typeof row !== "object") return null;
  const value = (row as Record<string, unknown>).value;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed) && parsed.every(isCartItem)) return parsed;
  } catch {
    return null;
  }
  return null;
}

function parseMetadataUserId(metadata: Record<string, unknown> | null | undefined): string | null {
  const topLevel = parseMetadataString(metadata, "kmxUserId");
  if (topLevel) return topLevel;
  const custom = metadata?.custom_fields;
  if (!Array.isArray(custom)) return null;
  const row = custom.find((v) => {
    if (!v || typeof v !== "object") return false;
    const variable = (v as Record<string, unknown>).variable_name;
    return variable === "kmx_user_id";
  });
  if (!row || typeof row !== "object") return null;
  const value = (row as Record<string, unknown>).value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  const provider = getPaymentProviderId();
  if (provider !== "paystack") {
    return NextResponse.json(
      { ok: false, error: `Payment webhook route unavailable for provider: ${provider}` },
      { status: 400 },
    );
  }

  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Paystack secret not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-paystack-signature")?.trim();
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload: PaystackWebhookBody;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = payload.data?.reference?.trim();
  const metadata = payload.data?.metadata ?? null;
  const items = parseMetadataItems(metadata);
  const userId = parseMetadataUserId(metadata);
  const customerEmail =
    parseMetadataString(metadata, "kmxCustomerEmail") ?? payload.data?.customer?.email?.trim() ?? null;

  if (!reference || !items || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Missing reference or cart metadata" }, { status: 400 });
  }

  try {
    const saved = await finalizePaystackPayment({
      reference,
      items,
      userId,
      customerEmail,
      paidAmountMinor: payload.data?.amount,
    });
    return NextResponse.json({
      ok: true,
      orderId: saved.orderId,
      trackingToken: saved.trackingToken || undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Order finalization failed";
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }
}
