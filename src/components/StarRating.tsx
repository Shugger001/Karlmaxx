import styles from "./StarRating.module.css";

type Props = {
  average: number;
  reviewCount: number;
  size?: "sm" | "md";
};

export function StarRating({ average, reviewCount, size = "sm" }: Props) {
  const filled = Math.min(5, Math.round(average));

  return (
    <div
      className={`${styles.wrap} ${size === "md" ? styles.md : ""}`}
      aria-label={`${average} out of 5 stars. ${reviewCount} reviews`}
    >
      <span className={styles.stars} aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={i <= filled ? styles.starFull : styles.starEmpty}
          >
            ★
          </span>
        ))}
      </span>
      <span className={styles.average}>{average}</span>
      <span className={styles.count}>({reviewCount})</span>
    </div>
  );
}
