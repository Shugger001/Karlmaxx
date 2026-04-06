import styles from "@/components/ContentPage.module.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested does not exist.",
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.lead}>
          That URL may have moved or was typed incorrectly. Head back to the shop
          or use the links below.
        </p>
      </header>
      <div className={styles.body}>
        <div className={styles.actions}>
          <Link className={styles.btnPrimary} href="/">
            Home
          </Link>
          <Link className={styles.btnGhost} href="/#collection">
            Catalog
          </Link>
          <Link className={styles.btnGhost} href="/contact">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
