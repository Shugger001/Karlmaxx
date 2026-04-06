import type { FulfillmentStage } from "@/types";

export const FULFILLMENT_STAGES: readonly FulfillmentStage[] = [
  "placed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const FULFILLMENT_LABELS: Record<FulfillmentStage, string> = {
  placed: "Order placed",
  preparing: "Preparing to ship",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export function isFulfillmentStage(x: string): x is FulfillmentStage {
  return (FULFILLMENT_STAGES as readonly string[]).includes(x);
}

export function fulfillmentStepIndex(stage: FulfillmentStage): number {
  return FULFILLMENT_STAGES.indexOf(stage);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
