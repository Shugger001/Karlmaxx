"use client";

import Link from "next/link";
import styles from "./HomeExplore.module.css";

/** Search terms — substring-match name/category/description in the product grid. */
const PICKS = [
  { label: "Bags & leather", q: "bag", blurb: "Carryalls, wallets, everyday pieces." },
  { label: "Fragrance", q: "perfume", blurb: "Scents and colognes in the catalog." },
  { label: "Watches", q: "watch", blurb: "Timepieces when listed." },
  { label: "Tech & more", q: "tech", blurb: "Gadgets and accessories." },
] as const;

export function HomeExplore() {
  return (
    <section className={styles.section} aria-labelledby="explore-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 id="explore-heading" className={styles.title}>
            Explore the catalog
          </h2>
          <p className={styles.sub}>
            Jump into a slice of the shop — filters apply from the URL so you can
            bookmark or share a view.
          </p>
        </div>
        <ul className={styles.grid}>
          <li>
            <Link href="/#collection" className={styles.card}>
              <span className={styles.cardKicker}>Everything</span>
              <span className={styles.cardTitle}>Shop all</span>
              <span className={styles.cardBlurb}>
                Browse the full grid and use category chips below.
              </span>
            </Link>
          </li>
          {PICKS.map((p) => (
            <li key={p.q}>
              <Link
                href={`/?q=${encodeURIComponent(p.q)}#collection`}
                className={styles.card}
              >
                <span className={styles.cardKicker}>Search</span>
                <span className={styles.cardTitle}>{p.label}</span>
                <span className={styles.cardBlurb}>{p.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
