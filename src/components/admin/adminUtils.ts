import type { Order } from "@/types";

export function downloadTextFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    "id",
    "status",
    "total",
    "user_id",
    "paystack_reference",
    "created_at",
    "items_json",
  ];
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...orders.map((o) =>
      [
        o.id,
        o.status,
        String(o.total),
        o.userId ?? "",
        o.paystackReference ?? "",
        o.createdAt ?? "",
        JSON.stringify(o.items),
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
