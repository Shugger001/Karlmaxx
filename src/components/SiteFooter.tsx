import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.col}>
            <h3 className={styles.heading}>Get to know us</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/#collection">Shop all</Link>
              </li>
              <li>
                <Link href="/login">Sign in</Link>
              </li>
              <li>
                <Link href="/signup">Create account</Link>
              </li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3 className={styles.heading}>Orders</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/checkout">Cart &amp; checkout</Link>
              </li>
              <li>
                <Link href="/login">Your account</Link>
              </li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3 className={styles.heading}>Help</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/checkout">Order help</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.trust}>
          Payments processed securely via Paystack. Your card details are never
          stored on our servers.
        </p>
        <div className={styles.bottom}>
          <p className={styles.brand}>Karlmaxx Investment Limited</p>
          <p className={styles.copy}>
            © {new Date().getFullYear()} Karlmaxx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
