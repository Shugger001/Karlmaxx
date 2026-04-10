import Image from "next/image";
import Link from "next/link";
import styles from "./HomeHero.module.css";

/** Hero showcase — editorial stills (Unsplash), tuned for menswear / bags / fragrance. */
const HERO_SHOWCASE = {
  newIn:
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80",
  bags: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
  fragrance:
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
} as const;

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Curated essentials for modern lifestyles</p>
          <h1 id="hero-heading" className={styles.title}>
            Premium menswear, bags, fragrance and lifestyle picks
          </h1>
          <p className={styles.lead}>
            Discover refined pieces that feel timeless. Shop a carefully selected
            catalog built for quality, confidence, and everyday luxury.
          </p>
          <div className={styles.cta}>
            <Link href="#collection" className={styles.btnPrimary}>
              Shop now
            </Link>
            <Link href="/checkout" prefetch={false} className={styles.btnGhost}>
              Go to cart
            </Link>
          </div>
          <p className={styles.accountStrip}>
            <Link href="/login" prefetch={false}>Sign in</Link>
            <span className={styles.accountSep} aria-hidden>
              ·
            </span>
            <Link href="/signup" prefetch={false}>Create an account</Link>
          </p>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Secure</dt>
              <dd className={styles.statValue}>Paystack</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Browse</dt>
              <dd className={styles.statValue}>Reviews</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Pickup</dt>
              <dd className={styles.statValue}>Fast cart</dd>
            </div>
          </dl>
        </div>
        <div className={styles.showcase}>
          <div className={styles.orb} aria-hidden />
          <div className={styles.stack}>
            <Link
              href="#collection"
              className={`${styles.frame} ${styles.frameA}`}
              aria-label="Shop new arrivals"
            >
              <Image
                src={HERO_SHOWCASE.newIn}
                alt=""
                fill
                sizes="(max-width: 900px) 45vw, 200px"
                fetchPriority="high"
                quality={78}
                className={`${styles.framePhoto} photo-surface-motion`}
                priority
              />
              <span className={styles.frameLabel}>New in</span>
            </Link>
            <Link
              href="#collection"
              className={`${styles.frame} ${styles.frameB}`}
              aria-label="Shop bags"
            >
              <Image
                src={HERO_SHOWCASE.bags}
                alt=""
                fill
                sizes="(max-width: 900px) 50vw, 220px"
                className={`${styles.framePhoto} photo-surface-motion-rev`}
              />
              <span className={styles.frameLabel}>Bags</span>
            </Link>
            <Link
              href="#collection"
              className={`${styles.frame} ${styles.frameC}`}
              aria-label="Shop fragrance"
            >
              <Image
                src={HERO_SHOWCASE.fragrance}
                alt=""
                fill
                sizes="(max-width: 900px) 40vw, 180px"
                className={`${styles.framePhoto} photo-surface-motion`}
              />
              <span className={styles.frameLabel}>Fragrance</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
