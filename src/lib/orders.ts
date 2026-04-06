import type { CartItem } from "@/types";
import { randomBytes } from "node:crypto";
import { normalizeEmail } from "./fulfillment";
import { getSupabaseAdmin } from "./supabase/admin";

function quantitiesByProductId(items: CartItem[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const i of items) {
    m.set(i.productId, (m.get(i.productId) ?? 0) + i.quantity);
  }
  return m;
}

export async function computeOrderTotalFromProducts(
  items: CartItem[],
): Promise<number | null> {
  const admin = getSupabaseAdmin();
  const need = quantitiesByProductId(items);
  let total = 0;
  for (const [productId, qty] of need) {
    const { data: row, error } = await admin
      .from("products")
      .select("price, stock")
      .eq("id", productId)
      .single();
    if (error || !row) return null;
    const price = typeof row.price === "string" ? parseFloat(row.price) : row.price;
    const stock = row.stock as number;
    if (typeof price !== "number" || Number.isNaN(price) || typeof stock !== "number") {
      return null;
    }
    if (stock < qty) return null;
    total += price * qty;
  }
  return Math.round(total * 100) / 100;
}

export async function savePaidOrder(input: {
  items: CartItem[];
  total: number;
  userId?: string | null;
  paystackReference: string;
  customerEmail?: string | null;
}): Promise<{ orderId: string; trackingToken: string }> {
  const admin = getSupabaseAdmin();
  const ref = input.paystackReference;

  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("id", ref)
    .maybeSingle();
  if (existing) {
    const { data: row } = await admin
      .from("orders")
      .select("tracking_token")
      .eq("id", ref)
      .maybeSingle();
    const tok =
      row && typeof (row as { tracking_token?: unknown }).tracking_token === "string"
        ? (row as { tracking_token: string }).tracking_token
        : "";
    return { orderId: ref, trackingToken: tok };
  }

  let computed = 0;
  const stockUpdates: { id: string; nextStock: number }[] = [];
  const need = quantitiesByProductId(input.items);

  for (const [productId, qty] of need) {
    const { data: row, error } = await admin
      .from("products")
      .select("price, stock")
      .eq("id", productId)
      .single();
    if (error || !row) {
      throw new Error("Product not found");
    }
    const price = typeof row.price === "string" ? parseFloat(row.price) : row.price;
    const stock = row.stock as number;
    if (typeof price !== "number" || Number.isNaN(price) || typeof stock !== "number") {
      throw new Error("Invalid product data");
    }
    if (stock < qty) {
      throw new Error("Insufficient stock");
    }
    computed += price * qty;
    stockUpdates.push({ id: productId, nextStock: stock - qty });
  }

  const rounded = Math.round(computed * 100) / 100;
  if (Math.abs(rounded - input.total) > 0.02) {
    throw new Error("Amount mismatch");
  }

  const emailNorm = input.customerEmail?.trim()
    ? normalizeEmail(input.customerEmail)
    : null;
  const trackingToken = randomBytes(24).toString("hex");

  const insertPayload: Record<string, unknown> = {
    id: ref,
    user_id: input.userId ?? null,
    items: input.items,
    total: rounded,
    status: "paid",
    paystack_reference: ref,
    tracking_token: trackingToken,
  };
  if (emailNorm) insertPayload.customer_email = emailNorm;

  const { error: insertErr } = await admin.from("orders").insert(insertPayload);

  if (insertErr) {
    if (insertErr.code === "23505") {
      const { data: row } = await admin
        .from("orders")
        .select("tracking_token")
        .eq("id", ref)
        .maybeSingle();
      const tok =
        row && typeof (row as { tracking_token?: unknown }).tracking_token === "string"
          ? (row as { tracking_token: string }).tracking_token
          : "";
      return { orderId: ref, trackingToken: tok };
    }
    throw new Error(insertErr.message);
  }

  for (const u of stockUpdates) {
    const { error: upErr } = await admin
      .from("products")
      .update({ stock: u.nextStock })
      .eq("id", u.id);
    if (upErr) {
      throw new Error(upErr.message);
    }
  }

  return { orderId: ref, trackingToken };
}
