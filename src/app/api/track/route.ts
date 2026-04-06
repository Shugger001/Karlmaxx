import {
  FULFILLMENT_LABELS,
  FULFILLMENT_STAGES,
  fulfillmentStepIndex,
  isFulfillmentStage,
  normalizeEmail,
} from "@/lib/fulfillment";
import { getSupabaseAdmin, isSupabaseServiceConfigured } from "@/lib/supabase/admin";
import { mapOrderRow } from "@/lib/supabase/maps";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FulfillmentStage } from "@/types";
import { NextResponse } from "next/server";

type TrackBody = {
  orderId?: string;
  email?: string;
  token?: string;
};

function publicOrderPayload(order: NonNullable<ReturnType<typeof mapOrderRow>>) {
  const stage = order.fulfillmentStage;
  const idx = fulfillmentStepIndex(stage);
  const timeline = FULFILLMENT_STAGES.map((s, i) => ({
    stage: s,
    label: FULFILLMENT_LABELS[s],
    done: i < idx,
    current: i === idx,
  }));
  return {
    id: order.id,
    total: order.total,
    paymentStatus: order.status,
    fulfillmentStage: stage,
    fulfillmentLabel: FULFILLMENT_LABELS[stage],
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      color: i.color,
    })),
    timeline,
  };
}

export async function POST(request: Request) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Tracking is not configured." },
      { status: 503 },
    );
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!token && (!orderId || !email)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Enter your order reference and email, or paste your tracking link token.",
      },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();

  let row: Record<string, unknown> | null = null;

  if (token) {
    const { data, error } = await admin
      .from("orders")
      .select("*")
      .eq("tracking_token", token)
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { ok: false, error: "Lookup failed. Try again." },
        { status: 500 },
      );
    }
    row = data as Record<string, unknown> | null;
  } else {
    const { data, error } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { ok: false, error: "Lookup failed. Try again." },
        { status: 500 },
      );
    }
    row = data as Record<string, unknown> | null;
  }

  if (!row) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not find that order. Check your reference and email, or contact support.",
      },
      { status: 404 },
    );
  }

  let authedUserId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    authedUserId = data.user?.id ?? null;
  } catch {
    authedUserId = null;
  }

  const userId = row.user_id;
  const ownerId = typeof userId === "string" ? userId : null;
  const storedEmail =
    typeof row.customer_email === "string" ? row.customer_email : null;
  const stageRaw = row.fulfillment_stage;
  const fulfillmentStage: FulfillmentStage =
    typeof stageRaw === "string" && isFulfillmentStage(stageRaw)
      ? stageRaw
      : "placed";

  const order = mapOrderRow({ ...row, fulfillment_stage: fulfillmentStage });
  if (!order) {
    return NextResponse.json({ ok: false, error: "Invalid order data." }, { status: 500 });
  }

  /** Token lookup is already unguessable; signed-in owner or email match otherwise. */
  let allowed = Boolean(token);
  if (!allowed && authedUserId && ownerId && authedUserId === ownerId) {
    allowed = true;
  }
  if (!allowed && storedEmail && email) {
    allowed = normalizeEmail(storedEmail) === normalizeEmail(email);
  }

  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: storedEmail
          ? "That email does not match this order. Use the address from checkout, or sign in if you purchased while logged in."
          : "This order has no email on file for lookup. Sign in if you bought while logged in, or contact support with your reference.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, order: publicOrderPayload(order) });
}
