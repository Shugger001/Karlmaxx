import styles from "./HomeTrustBar.module.css";

const ITEMS = [
  {
    title: "Paystack checkout",
    body: "Cards & mobile money, encrypted in transit.",
  },
  {
    title: "Curated catalog",
    body: "Menswear, bags, fragrance, watches & tech in one place.",
  },
  {
    title: "Need help?",
    body: "Use WhatsApp (when configured) or your account area.",
  },
] as const;

export function HomeTrustBar() {
  return (
    <div className={styles.wrap} role="region" aria-label="Why shop with us">
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.dot} aria-hidden />
            <div>
              <p className={styles.title}>{item.title}</p>
              <p className={styles.body}>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
