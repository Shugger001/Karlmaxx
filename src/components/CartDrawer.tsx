"use client";

import { useCart } from "@/context/CartContext";
import { formatCedis } from "@/lib/currency";
import Link from "next/link";
import { useEffect } from "react";
import { SafeImage } from "./SafeImage";
import styles from "./CartDrawer.module.css";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        aria-label="Close cart"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-hidden={!open}
        aria-modal={open}
        role="dialog"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your bag</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.list}>
          {items.length === 0 ? (
            <p className={styles.empty}>
              Your bag is empty. Explore the collection.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}:${item.color ?? ""}`}
                className={styles.row}
              >
                <div className={styles.thumb}>
                  <SafeImage
                    src={item.image}
                    alt=""
                    fill
                    sizes="72px"
                    style={{ objectFit: "cover" }}
                    photoMotionVariant="subtle"
                  />
                </div>
                <div className={styles.meta}>
                  <p className={styles.itemName}>{item.name}</p>
                  {item.color && (
                    <p className={styles.itemVariant}>Colour: {item.color}</p>
                  )}
                  <p className={styles.itemPrice}>
                    {formatCedis(item.price)} × {item.quantity}
                  </p>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1, item.color)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1, item.color)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeItem(item.productId, item.color)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <strong>
              {formatCedis(subtotal)}
            </strong>
          </div>
          <Link href="/checkout" className={styles.checkout} onClick={onClose}>
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
