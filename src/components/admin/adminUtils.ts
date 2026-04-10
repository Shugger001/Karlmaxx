import type { Order, Product } from "@/types";

export function downloadTextFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function orderItemsSummary(o: Order): string {
  return o.items
    .map((i) => {
      const c = i.color ? ` (${i.color})` : "";
      return `${i.name}${c} ×${i.quantity}`;
    })
    .join("; ");
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    "id",
    "status",
    "fulfillment_stage",
    "carrier",
    "tracking_number",
    "tracking_token",
    "customer_email",
    "total",
    "user_id",
    "paystack_reference",
    "created_at",
    "items_summary",
    "items_json",
    "admin_notes",
  ];
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...orders.map((o) =>
      [
        o.id,
        o.status,
        o.fulfillmentStage,
        o.carrier ?? "",
        o.trackingNumber ?? "",
        o.trackingToken ?? "",
        o.customerEmail ?? "",
        String(o.total),
        o.userId ?? "",
        o.paystackReference ?? "",
        o.createdAt ?? "",
        orderItemsSummary(o),
        JSON.stringify(o.items),
        o.adminNotes ?? "",
      ]
        .map(esc)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export function productsToCsv(products: Product[]): string {
  const headers = [
    "id",
    "name",
    "brand",
    "category",
    "price",
    "stock",
    "featured",
    "description",
    "images_json",
    "color_options_json",
    "created_at",
  ];
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...products.map((p) =>
      [
        p.id,
        p.name,
        p.brand,
        p.category,
        String(p.price),
        String(p.stock),
        p.featured ? "true" : "false",
        p.description,
        JSON.stringify(p.images),
        JSON.stringify(p.colorOptions),
        p.createdAt ?? "",
      ]
        .map(esc)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export function categoryCounts(
  categories: string[],
): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const c of categories) {
    const k = c.trim() || "Uncategorized";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
