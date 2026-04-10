import Link from "next/link";
import styles from "./HomeTrustBar.module.css";

const ITEMS = [
  {
    icon: "payment",
    title: "Paystack checkout",
    body: "Cards & mobile money, encrypted in transit.",
  },
  {
    icon: "catalog",
    title: "Curated catalog",
    body: "Menswear, bags, fragrance, watches & tech in one place.",
  },
  {
    icon: "support",
    title: "Need help?",
    body: (
      <>
        Visit{" "}
        <Link href="/contact" prefetch={false} className={styles.inlineLink}>
          Contact
        </Link>{" "}
        or{" "}
        <Link href="/faq" prefetch={false} className={styles.inlineLink}>
          FAQ
        </Link>
        .
      </>
    ),
  },
] as const;

function TrustIcon({ kind }: { kind: "payment" | "catalog" | "support" }) {
  if (kind === "payment") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9zm2 1.5h14V7.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5V9zm0 2v5.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V11H5z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (kind === "catalog") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17h-2V5H6.5a.5.5 0 0 0-.5.5V19a2 2 0 0 0 2 2H17v2H8a4 4 0 0 1-4-4V5.5z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9zm.75 13.5h-1.5v-1.5h1.5zm0-3h-1.5V7.5h1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomeTrustBar() {
  return (
    <div className={styles.wrap} role="region" aria-label="Why shop with us">
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.icon} aria-hidden>
              <TrustIcon kind={item.icon} />
            </span>
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
