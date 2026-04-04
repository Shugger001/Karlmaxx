const cedisFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Display prices in Ghana cedis (GH₵). */
export function formatCedis(amount: number): string {
  return cedisFormatter.format(amount);
}

/** Paystack Ghana: amount in pesewas (1 GHS = 100 pesewas). */
export function cedisToPesewas(cedis: number): number {
  return Math.max(0, Math.round(cedis * 100));
}
