"use client";

import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import { displayBrandLabel, groupProductsByBrand } from "@/lib/productGroups";
import { mapProductRow } from "@/lib/supabase/maps";
import { useShopSearch } from "@/context/ShopSearchContext";
import type { Product } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./ProductGrid.module.css";

const SKELETON_COUNT = 6;

/** Categories hidden from the storefront grid and category chips (inventory may remain in Admin). */
function isStorefrontExcludedCategory(category: string): boolean {
  return category.trim().toLowerCase() === "trousers";
}

export function ProductGrid() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery } = useShopSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Sub-filter when a category chip (Bags, Perfumes, etc.) is active. */
  const [categoryBrandFilter, setCategoryBrandFilter] = useState<"all" | string>("all");

  const qFromUrl = searchParams.get("q") ?? searchParams.get("category") ?? "";
  useEffect(() => {
    if (!qFromUrl.trim()) {
      setQuery("");
      return;
    }
    const decoded = decodeURIComponent(qFromUrl).trim();
    if (decoded) setQuery(decoded);
  }, [qFromUrl, setQuery]);

  function syncCatalogUrl(nextQuery: string) {
    if (pathname !== "/") return;
    const t = nextQuery.trim();
    if (!t) {
      router.replace("/");
      return;
    }
    router.replace(`/?q=${encodeURIComponent(t)}`);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setError(SUPABASE_CLIENT_SETUP_MESSAGE);
          setLoading(false);
        }
        return;
      }
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: qErr } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (qErr) {
          if (process.env.NODE_ENV === "development") {
             
            console.error(
              "Supabase products query failed:",
              qErr.message,
              qErr.code ?? "",
              qErr,
            );
          }
          const hint = qErr.message
            ? ` ${qErr.message}${qErr.code && typeof qErr.code === "string" ? ` (${qErr.code})` : ""}`
            : "";
          setError(
            `Could not load products. Check Supabase URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (anon or publishable), migrations, and RLS.${hint}`,
          );
          return;
        }
        const list: Product[] = [];
        for (const row of data ?? []) {
          const p = mapProductRow(row as Record<string, unknown>);
          if (p && !isStorefrontExcludedCategory(p.category)) list.push(p);
        }
        setProducts(list);
      } catch {
        if (!cancelled) {
          setError("Could not load products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ordered = useMemo(() => {
    const featured = products.filter((p) => p.featured);
    const rest = products.filter((p) => !p.featured);
    return [...featured, ...rest];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [ordered, query]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of products) {
      const c = p.category.trim();
      if (!c || seen.has(c.toLowerCase())) continue;
      seen.add(c.toLowerCase());
      out.push(c);
    }
    return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [products]);

  const trimmedQuery = query.trim();
  const matchedCategory = categories.find(
    (c) => c.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  const categoryChipActive = Boolean(matchedCategory);

  const strictCategoryProducts = useMemo(() => {
    if (!matchedCategory) return [];
    const want = matchedCategory.trim().toLowerCase();
    return filtered.filter((p) => p.category.trim().toLowerCase() === want);
  }, [matchedCategory, filtered]);

  const categoryBrandLabels = useMemo(
    () => groupProductsByBrand(strictCategoryProducts).map((g) => g.brand),
    [strictCategoryProducts],
  );

  const categoryProductsToShow = useMemo(() => {
    if (categoryBrandFilter === "all") return strictCategoryProducts;
    return strictCategoryProducts.filter(
      (p) => displayBrandLabel(p) === categoryBrandFilter,
    );
  }, [strictCategoryProducts, categoryBrandFilter]);

  useEffect(() => {
    if (matchedCategory) {
      setCategoryBrandFilter("all");
    }
  }, [matchedCategory]);

  const gridLayout = useMemo(() => {
    if (matchedCategory) {
      return { kind: "category-chip" as const };
    }
    return { kind: "flat" as const, items: filtered };
  }, [matchedCategory, filtered]);

  return (
    <section id="collection" className={styles.section}>
      <RevealOnScroll className={styles.headReveal}>
        <div className={styles.head}>
          <div>
            <h2>Results</h2>
            {!loading && !error && (
              <p className={styles.resultMeta}>
                {categoryChipActive
                  ? `${categoryProductsToShow.length} ${
                      categoryProductsToShow.length === 1 ? "item" : "items"
                    }${
                      categoryBrandFilter !== "all"
                        ? ` · ${categoryBrandFilter}`
                        : ""
                    }`
                  : filtered.length === ordered.length
                    ? `${ordered.length} items`
                    : `${filtered.length} of ${ordered.length} items match “${query.trim()}”`}
              </p>
            )}
          </div>
          <p className={styles.tagline}>
            Today&apos;s deals on menswear, bags, fragrance, watches, and tech.
          </p>
        </div>
      </RevealOnScroll>
      <RevealOnScroll className={styles.gridReveal} delayMs={80}>
        {!loading && !error && categories.length > 0 && (
          <div
            className={styles.chips}
            role="toolbar"
            aria-label="Filter by category"
          >
            <button
              type="button"
              className={`${styles.chip} ${trimmedQuery === "" ? styles.chipActive : ""}`}
              onClick={() => {
                setQuery("");
                syncCatalogUrl("");
              }}
            >
              All
            </button>
            {categories.map((cat) => {
              const isActive = matchedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                  onClick={() => {
                    setQuery(cat);
                    syncCatalogUrl(cat);
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
        {!loading &&
          !error &&
          categoryChipActive &&
          strictCategoryProducts.length > 0 && (
            <div className={styles.chipSubWrap}>
              <p className={styles.chipSubLabel}>
                Brands — {matchedCategory}
              </p>
              <div
                className={styles.chipSubRow}
                role="toolbar"
                aria-label={`Filter ${matchedCategory} by brand`}
              >
                <button
                  type="button"
                  className={`${styles.chip} ${categoryBrandFilter === "all" ? styles.chipActive : ""}`}
                  onClick={() => setCategoryBrandFilter("all")}
                >
                  All brands
                </button>
                {categoryBrandLabels.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={`${styles.chip} ${categoryBrandFilter === brand ? styles.chipActive : ""}`}
                    onClick={() => setCategoryBrandFilter(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        <div className={styles.gridOuter}>
        {loading && (
          <div className={styles.grid}>
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}
        {!loading && error && (
          <p className={`${styles.state} ${styles.error}`}>{error}</p>
        )}
        {!loading && !error && ordered.length === 0 && (
          <p className={styles.state}>
            No products yet. Add inventory from the admin console.
          </p>
        )}
        {!loading && !error && ordered.length > 0 && filtered.length === 0 && (
          <p className={styles.state}>
            No results for &quot;{query.trim()}&quot;. Try another search.
          </p>
        )}
        {!loading && !error && filtered.length > 0 && gridLayout.kind === "flat" && (
          <div className={styles.grid}>
            {gridLayout.items.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                style={{ animationDelay: `${Math.min(i * 0.06, 0.6)}s` }}
              />
            ))}
          </div>
        )}
        {!loading &&
          !error &&
          gridLayout.kind === "category-chip" &&
          strictCategoryProducts.length > 0 && (
            <div className={styles.grid}>
              {categoryProductsToShow.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  style={{ animationDelay: `${Math.min(i * 0.06, 0.6)}s` }}
                />
              ))}
            </div>
          )}
        {!loading &&
          !error &&
          gridLayout.kind === "category-chip" &&
          strictCategoryProducts.length === 0 &&
          ordered.length > 0 && (
            <p className={styles.state}>No products in this category yet.</p>
          )}
        {!loading &&
          !error &&
          gridLayout.kind === "category-chip" &&
          strictCategoryProducts.length > 0 &&
          categoryProductsToShow.length === 0 && (
            <p className={styles.state}>No products for this brand.</p>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
