"use client";

import { useCart } from "@/context/CartContext";
import { formatCedis } from "@/lib/currency";
import { defaultListingImage } from "@/lib/productDisplay";
import { mockRatingForProductId } from "@/lib/mockRating";
import type { Product } from "@/types";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { SafeImage } from "./SafeImage";
import { StarRating } from "./StarRating";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  style?: CSSProperties;
};

export function ProductCard({ product, style }: ProductCardProps) {
  const { addItem } = useCart();
  const listImage = defaultListingImage(product);
  const defaultColor = product.colorOptions[0]?.name;
  const inStock = product.stock > 0;
  const rating = useMemo(
    () => mockRatingForProductId(product.id),
    [product.id],
  );

  return (
    <article className={styles.card} style={style}>
      <Link href={`/products/${product.id}`} className={styles.imageWrap}>
        {product.featured && (
          <span className={styles.featured}>Featured</span>
        )}
        <SafeImage
          src={listImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </Link>
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        {product.brand.trim() !== "" && (
          <span className={styles.brandLine}>{product.brand}</span>
        )}
        <Link href={`/products/${product.id}`} className={styles.titleLink}>
          <h2 className={styles.name}>{product.name}</h2>
        </Link>
        <StarRating
          average={rating.average}
          reviewCount={rating.reviewCount}
        />
        {product.colorOptions.length > 0 && (
          <div className={styles.swatches} aria-hidden>
            {product.colorOptions.map((c) => (
              <span
                key={c.name}
                className={styles.swatch}
                style={{ background: c.hex ?? "#94a3b8" }}
                title={c.name}
              />
            ))}
          </div>
        )}
        <p className={styles.price}>
          {formatCedis(product.price)}
        </p>
        <div className={styles.actions}>
          <Link href={`/products/${product.id}`} className={styles.btnGhost}>
            Learn more
          </Link>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!inStock}
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: defaultListingImage(product),
                ...(defaultColor ? { color: defaultColor } : {}),
              })
            }
          >
            Add to cart
          </button>
        </div>
        {!inStock && (
          <p className={styles.outOfStock}>Out of stock</p>
        )}
      </div>
    </article>
  );
}
