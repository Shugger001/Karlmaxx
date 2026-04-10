"use client";

import { useCart } from "@/context/CartContext";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import { formatCedis } from "@/lib/currency";
import { mockRatingForProductId } from "@/lib/mockRating";
import { galleryUrls, imageForColor } from "@/lib/productDisplay";
import { isEligibleRelatedProduct } from "@/lib/storefrontFilters";
import { mapProductRow } from "@/lib/supabase/maps";
import type { Product } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { SafeImage } from "./SafeImage";
import { StarRating } from "./StarRating";
import styles from "./ProductDetail.module.css";

type Props = { productId: string };

export function ProductDetail({ productId }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined,
  );
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
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
          .eq("id", productId)
          .maybeSingle();
        if (cancelled) return;
        if (qErr) {
          // Keep the UI friendly, but log the real cause for debugging (RLS, env misconfig, etc.).
           
          console.error("Supabase product query failed:", qErr);
          setError("Could not load product.");
          return;
        }
        if (!data) {
          setProduct(null);
          return;
        }
        const p = mapProductRow(data as Record<string, unknown>);
        if (!p) {
          setProduct(null);
          return;
        }
        setProduct(p);
        setSelectedColor(p.colorOptions[0]?.name);
      } catch (err) {
         
        console.error("Supabase product query threw:", err);
        if (!cancelled) setError("Could not load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!product) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: qErr } = await supabase
          .from("products")
          .select("*")
          .eq("category", product.category)
          .neq("id", product.id)
          .order("created_at", { ascending: false })
          .limit(24);
        if (cancelled) return;
        if (qErr) {
          console.error("Related products query failed:", qErr);
          setRelated([]);
          return;
        }
        const list: Product[] = [];
        for (const row of data ?? []) {
          const p = mapProductRow(row as Record<string, unknown>);
          if (!p || !isEligibleRelatedProduct(p.category, product.category)) {
            continue;
          }
          list.push(p);
        }
        list.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          const sa = a.stock > 0 ? 1 : 0;
          const sb = b.stock > 0 ? 1 : 0;
          if (sa !== sb) return sb - sa;
          return 0;
        });
        setRelated(list.slice(0, 4));
      } catch (e) {
        console.error("Related products:", e);
        if (!cancelled) setRelated([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const urls = useMemo(
    () => (product ? galleryUrls(product, selectedColor) : []),
    [product, selectedColor],
  );

  const rating = useMemo(
    () => mockRatingForProductId(productId),
    [productId],
  );

  if (loading) {
    return (
      <div className={styles.stateCard}>
        <p className={styles.stateIcon} aria-hidden>
          *
        </p>
        <p className={styles.state}>Loading product details…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`${styles.stateCard} ${styles.errorState}`}>
        <p className={styles.stateIcon} aria-hidden>
          !
        </p>
        <p className={`${styles.state} ${styles.error}`}>{error}</p>
        <button
          type="button"
          className={styles.stateAction}
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }
  if (!product) {
    return (
      <div className={styles.stateCard}>
        <p className={styles.stateIcon} aria-hidden>
          *
        </p>
        <p>Product not found.</p>
        <Link href="/" className={styles.stateActionLink} style={{ marginTop: "1rem" }}>
          Back to shop
        </Link>
      </div>
    );
  }

  const mainImage = urls[0] ?? "/placeholder-product.svg";
  const inStock = product.stock > 0;
  const cartImage = imageForColor(product, selectedColor);

  return (
    <Fragment>
    <div className={styles.detailHoverZone}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Karlmaxx</Link>
        <span className={styles.crumbSep} aria-hidden>
          ›
        </span>
        <Link href="/#collection">{product.category}</Link>
        <span className={styles.crumbSep} aria-hidden>
          ›
        </span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </nav>
      <Link href="/#collection" className={styles.back}>
        ← Back to results
      </Link>
      <div className={styles.wrap}>
        <div>
          <div className={styles.gallery}>
            <SafeImage
              src={mainImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <div className={styles.meta}>
          <div className={styles.buyBox}>
            <span className={styles.kicker}>{product.category}</span>
            {product.brand.trim() !== "" && (
              <span className={styles.brandSub}>{product.brand}</span>
            )}
            <h1 className={styles.title}>{product.name}</h1>
            <StarRating
              average={rating.average}
              reviewCount={rating.reviewCount}
              size="md"
            />
            <div
              id="reviews"
              className={styles.reviewsHook}
              tabIndex={-1}
              aria-hidden
            />
            <p className={styles.priceLine}>
              <span className={styles.price}>{formatCedis(product.price)}</span>
            </p>
            {inStock && (
              <p className={styles.delivery}>
                <span className={styles.deliveryIcon} aria-hidden>
                  ✓
                </span>
                FREE delivery on orders from Karlmaxx when you meet minimums at
                checkout.
              </p>
            )}
            <p className={styles.desc}>{product.description}</p>
            {product.colorOptions.length > 0 && (
              <div className={styles.colorSection}>
                <span className={styles.colorLabel}>Colour</span>
                <div className={styles.colors}>
                  {product.colorOptions.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`${styles.colorBtn} ${selectedColor === c.name ? styles.colorBtnActive : ""}`}
                      onClick={() => setSelectedColor(c.name)}
                    >
                      <span
                        className={styles.colorDot}
                        style={{ background: c.hex ?? "#94a3b8" }}
                        aria-hidden
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p
              className={`${styles.stock} ${inStock ? styles.inStock : styles.outStock}`}
            >
              {inStock ? `In stock — ${product.stock} left` : "Unavailable"}
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={!inStock}
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: cartImage,
                    ...(selectedColor ? { color: selectedColor } : {}),
                  })
                }
              >
                Add to Cart
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={!inStock}
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: cartImage,
                    ...(selectedColor ? { color: selectedColor } : {}),
                  });
                  router.push("/checkout");
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {related.length > 0 ? (
      <section className={styles.related} aria-labelledby="related-heading">
        <div className={styles.relatedInner}>
          <h2 id="related-heading" className={styles.relatedTitle}>
            You may also like
          </h2>
          <p className={styles.relatedSub}>More in {product.category}</p>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    ) : null}
    </Fragment>
  );
}
