import { computeOrderTotalFromProducts, savePaidOrder } from "@/lib/orders";
import { isSupabaseServiceConfigured } from "@/lib/supabase/admin";
import type { CartItem } from "@/types";
import { createHmac, timingSafeEqual } from "node:crypto";

export type FinalizeInput = {
  reference: string;
  items: CartItem[];
  userId?: string | null;
  customerEmail?: string | null;
  paidAmountMinor?: number;
};

export type FinalizeResult = {
  orderId: string;
  trackingToken: string;
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

export async function finalizePaystackPayment(input: FinalizeInput): Promise<FinalizeResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack secret not configured");
  if (!isSupabaseServiceConfigured()) throw new Error("Supabase service role not configured");

  const reference = input.reference.trim();
  if (!reference || !Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("reference and items are required");
  }
  if (!input.items.every(isCartItem)) throw new Error("Invalid cart items");

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  const paystackData = (await paystackRes.json()) as {
    status?: boolean;
    message?: string;
    data?: { status?: string; amount?: number };
  };
  if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== "success") {
    throw new Error(paystackData.message ?? "Verification failed");
  }

  const amountMinor = paystackData.data?.amount;
  if (typeof amountMinor !== "number") throw new Error("Invalid Paystack response");
  if (typeof input.paidAmountMinor === "number" && Math.abs(input.paidAmountMinor - amountMinor) > 1) {
    throw new Error("Webhook amount mismatch");
  }

  const paidCedis = amountMinor / 100;
  const computed = await computeOrderTotalFromProducts(input.items);
  if (computed === null) throw new Error("Could not validate order against catalog");
  if (Math.abs(computed - paidCedis) > 0.02) throw new Error("Paid amount does not match order total");

  return savePaidOrder({
    items: input.items,
    total: computed,
    userId: input.userId ?? null,
    paystackReference: reference,
    customerEmail: input.customerEmail?.trim() || null,
  });
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature, "hex");
  const digestBuf = Buffer.from(digest, "hex");
  return sigBuf.length === digestBuf.length && timingSafeEqual(sigBuf, digestBuf);
}
