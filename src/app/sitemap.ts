import { createSupabaseAnonReadClient } from "@/lib/supabase/anonReadClient";
import { siteUrl } from "@/lib/siteUrl";
import type { MetadataRoute } from "next";

const STATIC_PATHS = [
  { path: "", changeFrequency: "daily" as const, priority: 1 },
  { path: "/checkout", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/track", changeFrequency: "monthly" as const, priority: 0.55 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/signup", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/faq", changeFrequency: "weekly" as const, priority: 0.65 },
  { path: "/shipping", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/returns", changeFrequency: "monthly" as const, priority: 0.62 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.4 },
] satisfies ReadonlyArray<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const supabase = createSupabaseAnonReadClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("id, updated_at")
      .order("updated_at", { ascending: false });
    if (!error && data?.length) {
      for (const row of data) {
        const id = row.id as string | undefined;
        if (!id) continue;
        const updated =
          row.updated_at != null ? new Date(String(row.updated_at)) : now;
        entries.push({
          url: `${base}/products/${id}`,
          lastModified: updated,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
