import { isWatchProductCategory } from "@/lib/localCatalogImages";
import type { Product } from "@/types";

export { isWatchProductCategory };

export function displayBrandLabel(product: Product): string {
  const b = product.brand.trim();
  return b || "Other brands";
}

/** Preserves product order within each brand bucket. */
export function groupProductsByBrand(products: Product[]): { brand: string; items: Product[] }[] {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const label = displayBrandLabel(p);
    const list = map.get(label);
    if (list) list.push(p);
    else map.set(label, [p]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map(([brand, items]) => ({ brand, items }));
}

export function partitionWatchProducts(products: Product[]): {
  watches: Product[];
  other: Product[];
} {
  const watches: Product[] = [];
  const other: Product[] = [];
  for (const p of products) {
    if (isWatchProductCategory(p.category)) watches.push(p);
    else other.push(p);
  }
  return { watches, other };
}
