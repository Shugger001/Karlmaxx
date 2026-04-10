"use client";

import { cedisToPesewas } from "@/lib/currency";
import { getClientPaymentProviderId, getPaymentProviderLabel } from "@/lib/payments/provider";
import type { CartItem } from "@/types";

export type ClientPaymentInput = {
  amountCedis: number;
  email: string;
  fullName: string;
  items: CartItem[];
  userId?: string | null;
  onSuccess: (result: { reference: string }) => Promise<void> | void;
  onClose?: () => void;
};

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.PaystackPop) {
      resolve();
      return;
    }
    const existing = document.getElementById("paystack-inline-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Paystack script failed")));
      return;
    }
    const s = document.createElement("script");
    s.id = "paystack-inline-js";
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Paystack script failed"));
    document.body.appendChild(s);
  });
}

export function getClientPaymentUi() {
  const provider = getClientPaymentProviderId();
  const label = getPaymentProviderLabel(provider);
  const cta = `Pay with ${label}`;
  if (provider === "moolr") {
    return { provider, label, cta, configured: false };
  }
  const configured = Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim());
  return { provider, label, cta, configured };
}

export async function startClientPayment(input: ClientPaymentInput): Promise<void> {
  const provider = getClientPaymentProviderId();
  if (provider === "moolr") {
    throw new Error("Moolr provider is not implemented yet.");
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
  if (!publicKey.trim()) throw new Error("Paystack is not configured.");

  await loadPaystackScript();
  const PaystackPop = window.PaystackPop;
  if (!PaystackPop) throw new Error("Payment could not load. Try again.");

  const reference = `kmx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const handler = PaystackPop.setup({
    key: publicKey,
    email: input.email.trim(),
    amount: cedisToPesewas(input.amountCedis),
    ref: reference,
    currency: "GHS",
    callback: async (response: { reference: string }) => {
      await input.onSuccess({ reference: response.reference });
    },
    onClose: () => {
      input.onClose?.();
    },
    metadata: {
      kmxCartItems: input.items,
      kmxUserId: input.userId ?? null,
      kmxCustomerEmail: input.email.trim(),
      custom_fields: [
        { display_name: "Customer", variable_name: "customer_name", value: input.fullName || "Guest" },
        {
          display_name: "Cart",
          variable_name: "kmx_cart_items_json",
          value: JSON.stringify(input.items),
        },
        {
          display_name: "User ID",
          variable_name: "kmx_user_id",
          value: input.userId ?? "",
        },
      ],
    },
  });
  handler.openIframe();
}
