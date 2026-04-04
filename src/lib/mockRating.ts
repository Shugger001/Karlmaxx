/** Deterministic mock rating for grid / PDP (Amazon-style social proof). */
export function mockRatingForProductId(id: string): {
  average: number;
  reviewCount: number;
} {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) >>> 0;
  }
  const average = Math.round((3.7 + (h % 13) / 10) * 10) / 10;
  const reviewCount = 48 + (h % 920);
  return { average, reviewCount };
}
