import styles from "./ProductSkeleton.module.css";

export function ProductSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={styles.lineSm} />
        <div className={styles.lineLg} />
        <div className={styles.rating} />
        <div className={styles.lineMd} />
        <div className={styles.actions}>
          <div className={styles.btnGhost} />
          <div className={styles.btnPrimary} />
        </div>
      </div>
    </div>
  );
}
