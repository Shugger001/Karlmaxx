export type PaymentProviderId = "paystack" | "moolr";

export function getPaymentProviderId(): PaymentProviderId {
  const raw = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (raw === "moolr") return "moolr";
  return "paystack";
}

export function getPaymentProviderLabel(provider: PaymentProviderId): string {
  switch (provider) {
    case "moolr":
      return "Moolr";
    case "paystack":
    default:
      return "Paystack";
  }
}

export function getClientPaymentProviderId(): PaymentProviderId {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER?.trim().toLowerCase();
  if (raw === "moolr") return "moolr";
  return "paystack";
}
