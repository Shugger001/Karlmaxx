/**
 * Storefront contact details — update for production (and optional WhatsApp).
 * WhatsApp: E.164 digits only, no + (e.g. 233241234567 for Ghana).
 */
export const SITE_CONTACT = {
  legalName: "Karlmaxx Investment Limited",
  email: "hello@karlmaxx.com",
  /** Display string shown to customers */
  phoneDisplay: "",
  /** tel: href value, e.g. +233241234567 */
  phoneTel: "",
  whatsappDigits: "",
} as const;

export function whatsappChatUrl(): string | null {
  const d = SITE_CONTACT.whatsappDigits.replace(/\D/g, "");
  return d.length >= 8 ? `https://wa.me/${d}` : null;
}
