import type { Product } from "@/types";

/** Primary image URL for grid / default cart line. */
export function defaultListingImage(product: Product): string {
  const fromCatalog = product.images[0];
  if (fromCatalog) return fromCatalog;
  const fromColor = product.colorOptions[0]?.image;
  if (fromColor) return fromColor;
  return "/placeholder-product.svg";
}

/** Image for a named color variant, falling back to the first catalog image. */
export function imageForColor(product: Product, colorName?: string): string {
  if (!colorName) {
    return product.images[0] ?? product.colorOptions[0]?.image ?? "/placeholder-product.svg";
  }
  const opt = product.colorOptions.find((c) => c.name === colorName);
  if (opt?.image) return opt.image;
  return product.images[0] ?? "/placeholder-product.svg";
}

/** Ordered gallery: selected variant first, then remaining product images, then other variant shots. */
export function galleryUrls(product: Product, selectedColor?: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: string | undefined) => {
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  };
  push(imageForColor(product, selectedColor));
  for (const u of product.images) push(u);
  for (const c of product.colorOptions) push(c.image);
  if (out.length === 0) push("/placeholder-product.svg");
  return out;
}
