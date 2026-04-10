"use client";

import Link from "next/link";
import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./HomeExplore.module.css";
import { useShopSearch } from "@/context/ShopSearchContext";

const PICKS = [
  {
    label: "Bags & Leather",
    q: "bag",
    blurb: "Explore premium carryalls, wallets, and everyday leather essentials.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    tone: "green",
  },
  {
    label: "Tech Essentials",
    q: "tech",
    blurb: "Discover curated gadgets and modern accessories for daily life.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    tone: "blue",
  },
  {
    label: "Menswear",
    q: "menswear",
    blurb: "Elevate your wardrobe with polished staples and statement pieces.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    tone: "purple",
  },
  {
    label: "Fragrances",
    q: "perfume",
    blurb: "Find sophisticated scents for everyday confidence and occasion wear.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
    tone: "amber",
  },
  {
    label: "Watches",
    q: "watch",
    blurb: "Browse timeless wristwear to complete your premium look.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
    tone: "rose",
  },
  {
    label: "Health & Wellness",
    q: "wellness",
    blurb: "Shop personal care and wellness-led lifestyle additions.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    tone: "indigo",
  },
] as const;

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoryIcon({ tone }: { tone: (typeof PICKS)[number]["tone"] }) {
  return <span className={`${styles.iconDot} ${styles[`iconDot_${tone}`]}`} aria-hidden />;
}

export function HomeExplore() {
  const { setQuery } = useShopSearch();

  return (
    <section className={styles.section} aria-labelledby="explore-heading">
      <header className={styles.heroShell}>
        <div className={styles.heroPattern} aria-hidden />
        <div className={styles.heroInner}>
          <h1 id="explore-heading" className={styles.heroTitle}>
            Shop by Category
          </h1>
          <p className={styles.heroSub}>
            Explore our curated collections and find exactly what you&apos;re looking for.
          </p>
        </div>
      </header>
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {PICKS.map((p, i) => (
            <li key={p.q} className={styles.item}>
              <RevealOnScroll className={styles.cardReveal} delayMs={i * 55}>
                <Link
                  href={`/category/${toSlug(p.label)}?q=${encodeURIComponent(p.q)}&label=${encodeURIComponent(p.label)}`}
                  prefetch={false}
                  className={styles.card}
                  onClick={() => setQuery(p.label)}
                >
                  <div className={styles.cardImageWrap}>
                    <div
                      className={styles.cardImage}
                      style={{ backgroundImage: `url(${p.image})` }}
                      aria-hidden
                    />
                    <div
                      className={`${styles.cardImageOverlay} ${styles[`cardImageOverlay_${p.tone}`]}`}
                      aria-hidden
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeading}>
                      <CategoryIcon tone={p.tone} />
                      <div>
                        <span className={styles.cardTitle}>{p.label}</span>
                        <span className={styles.cardKicker}>Collection</span>
                      </div>
                    </div>
                    <p className={styles.cardBlurb}>{p.blurb}</p>
                    <div className={styles.cardCtaRow}>
                      <span className={styles.cardCta}>Browse Collection</span>
                      <span className={styles.cardCtaArrow} aria-hidden>
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
