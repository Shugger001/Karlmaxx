/**
 * On-disk product shots under /public/catalog. Assigned by category so Watches /
 * Fragrance & perfume SKUs show the New Karlmaxx Pics set without DB changes.
 */

export const LOCAL_WATCH_IMAGE_PATHS: readonly string[] = [
  "/catalog/watches/watch-01.jpeg",
  "/catalog/watches/watch-02.png",
  "/catalog/watches/watch-03.png",
  "/catalog/watches/watch-04.png",
  "/catalog/watches/watch-05.png",
  "/catalog/watches/watch-06.png",
  "/catalog/watches/watch-07.png",
  "/catalog/watches/watch-08.png",
  "/catalog/watches/watch-09.png",
  "/catalog/watches/watch-10.png",
  "/catalog/watches/watch-11.png",
  "/catalog/watches/watch-12.png",
  "/catalog/watches/watch-13.png",
  "/catalog/watches/watch-14.png",
  "/catalog/watches/watch-15.png",
  "/catalog/watches/watch-16.png",
];

export const LOCAL_PERFUME_IMAGE_PATHS: readonly string[] = [
  "/catalog/perfumes/perfume-01.png",
  "/catalog/perfumes/perfume-02.png",
  "/catalog/perfumes/perfume-03.png",
  "/catalog/perfumes/perfume-04.png",
  "/catalog/perfumes/perfume-05.png",
];

function poolStartIndex(seed: string, poolLength: number): number {
  if (poolLength <= 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) >>> 0;
  }
  return h % poolLength;
}

function normalizedVisualKind(category: string): "watches" | "perfumes" | null {
  const c = category.trim().toLowerCase();
  if (c.includes("watch")) return "watches";
  if (c.includes("fragrance") || c.includes("perfume") || c.includes("cologne")) {
    return "perfumes";
  }
  return null;
}

/** True when `category` is treated as watches for local imagery / storefront grouping. */
export function isWatchProductCategory(category: string): boolean {
  return normalizedVisualKind(category) === "watches";
}

/**
 * Full local gallery for watches / perfumes: every asset in the pool, in a
 * product-specific rotation so SKUs don’t all share the same lead image.
 */
export function localCatalogImagePaths(
  category: string,
  productId: string,
): string[] | null {
  const kind = normalizedVisualKind(category);
  if (!kind) return null;
  const pool =
    kind === "watches" ? LOCAL_WATCH_IMAGE_PATHS : LOCAL_PERFUME_IMAGE_PATHS;
  if (pool.length === 0) return null;
  const start = poolStartIndex(productId, pool.length);
  const out: string[] = [];
  for (let i = 0; i < pool.length; i++) {
    out.push(pool[(start + i) % pool.length]!);
  }
  return out;
}
