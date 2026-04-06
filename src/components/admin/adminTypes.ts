export type AdminViewId =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "system";

/** App Router paths — use for nav, links, and bookmarks. */
export const ADMIN_SECTION_HREF: Record<AdminViewId, string> = {
  overview: "/admin/overview",
  products: "/admin/products",
  orders: "/admin/orders",
  customers: "/admin/customers",
  system: "/admin/system",
};
