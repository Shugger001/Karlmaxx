import Link from "next/link";
import styles from "./HomeJoinBand.module.css";

export function HomeJoinBand() {
  return (
    <section className={styles.wrap} aria-labelledby="join-community-heading">
      <div className={styles.inner}>
        <h2 id="join-community-heading" className={styles.title}>
          Join Our Community
        </h2>
        <p className={styles.sub}>
          Get exclusive access to new arrivals, secret sales, and product sourcing stories.
        </p>
        <div className={styles.actions}>
          <Link href="/signup" prefetch={false} className={styles.btnPrimary}>
            Join
          </Link>
          <Link href="/contact" prefetch={false} className={styles.btnGhost}>
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
