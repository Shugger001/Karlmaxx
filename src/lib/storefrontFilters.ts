/** Categories hidden from the main storefront grid (inventory may remain in Admin). */
export function isStorefrontExcludedCategory(category: string): boolean {
  return category.trim().toLowerCase() === "trousers";
}

/** Related products use the same visibility rule as the catalog for excluded categories. */
export function isEligibleRelatedProduct(
  candidateCategory: string,
  viewingCategory: string,
): boolean {
  if (!isStorefrontExcludedCategory(candidateCategory)) return true;
  return (
    candidateCategory.trim().toLowerCase() === viewingCategory.trim().toLowerCase()
  );
}
