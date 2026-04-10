import styles from "./HomePromoStrip.module.css";

export function HomePromoStrip() {
  return (
    <div className={styles.strip} role="status" aria-label="Store pickup notice">
      <p>
        Free Store Pickup Available
        <span className={styles.sep} aria-hidden>
          |
        </span>
        Order Online, Pick Up Today
      </p>
    </div>
  );
}
