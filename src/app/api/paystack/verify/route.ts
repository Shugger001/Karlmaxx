import { isSupabaseServiceConfigured } from "@/lib/supabase/admin";
import { computeOrderTotalFromProducts, savePaidOrder } from "@/lib/orders";
import type { CartItem } from "@/types";
import { NextResponse } from "next/server";

type VerifyBody = {
  reference?: string;
  items?: CartItem[];
  userId?: string | null;
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

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Paystack secret not configured" },
      { status: 503 },
    );
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase service role not configured" },
      { status: 503 },
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

  if (!items.every(isCartItem)) {
    return NextResponse.json({ ok: false, error: "Invalid cart items" }, { status: 400 });
  }

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    },
  );

  const paystackData = (await paystackRes.json()) as {
    status?: boolean;
    message?: string;
    data?: { status?: string; amount?: number };
  };

  if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== "success") {
    return NextResponse.json(
      { ok: false, error: paystackData.message ?? "Verification failed" },
      { status: 402 },
    );
  }

  /** Smallest currency unit (pesewas for GHS). */
  const amountMinor = paystackData.data?.amount;
  if (typeof amountMinor !== "number") {
    return NextResponse.json({ ok: false, error: "Invalid Paystack response" }, { status: 502 });
  }

  const paidCedis = amountMinor / 100;

  const computed = await computeOrderTotalFromProducts(items);
  if (computed === null) {
    return NextResponse.json(
      { ok: false, error: "Could not validate order against catalog" },
      { status: 400 },
    );
  }

  if (Math.abs(computed - paidCedis) > 0.02) {
    return NextResponse.json(
      { ok: false, error: "Paid amount does not match order total" },
      { status: 400 },
    );
  }

  try {
    const orderId = await savePaidOrder({
      items,
      total: computed,
      userId: body.userId ?? null,
      paystackReference: reference,
    });
    return NextResponse.json({ ok: true, orderId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Order failed";
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }
}
