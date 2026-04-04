import Link from "next/link";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Free delivery on qualifying orders</p>
          <h1 id="hero-heading" className={styles.title}>
            Shop menswear, bags, fragrance &amp; more
          </h1>
          <p className={styles.lead}>
            Low prices on quality pieces. Browse the catalog, read reviews, and
            check out securely with Paystack.
          </p>
          <div className={styles.cta}>
            <Link href="#collection" className={styles.btnPrimary}>
              Shop now
            </Link>
            <Link href="/checkout" className={styles.btnGhost}>
              Go to cart
            </Link>
          </div>
          <p className={styles.accountStrip}>
            <Link href="/login">Sign in</Link>
            <span className={styles.accountSep} aria-hidden>
              ·
            </span>
            <Link href="/signup">Create an account</Link>
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
        <div className={styles.showcase} aria-hidden>
          <div className={styles.orb} />
          <div className={styles.stack}>
            <div className={`${styles.frame} ${styles.frameA}`}>
              <span className={styles.frameLabel}>New in</span>
            </div>
            <div className={`${styles.frame} ${styles.frameB}`}>
              <span className={styles.frameLabel}>Bags</span>
            </div>
            <div className={`${styles.frame} ${styles.frameC}`}>
              <span className={styles.frameLabel}>Fragrance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
