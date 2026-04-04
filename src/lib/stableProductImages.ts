/** Deterministic Picsum URLs so every product has loadable images without DB writes. */

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

export function picsumCatalogImages(productId: string): string[] {
  return [
    `https://picsum.photos/seed/kx-${simpleHash(`${productId}:0`)}/800/1067`,
    `https://picsum.photos/seed/kx-${simpleHash(`${productId}:1`)}/800/1067`,
    `https://picsum.photos/seed/kx-${simpleHash(`${productId}:2`)}/800/1067`,
  ];
}

export function picsumVariantImage(productId: string, variantKey: string): string {
  return `https://picsum.photos/seed/kx-${simpleHash(`${productId}:${variantKey}`)}/800/1067`;
}

/**
 * Empty URLs become deterministic Picsum. Hosts like Pexels / Supabase storage are kept as-is.
 * Legacy Unsplash entries may still 404; replace those in the database with stable URLs.
 */
export function preferStableImageUrl(
  url: string,
  productId: string,
  salt: string,
): string {
  const t = url.trim();
  if (!t) {
    return picsumVariantImage(productId, salt);
  }
  return t;
}
