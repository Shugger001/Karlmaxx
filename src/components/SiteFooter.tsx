import { getSocialLinks } from "@/lib/siteSocial";
import Link from "next/link";
import { FooterSocialIcon } from "./FooterSocialIcon";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const socialLinks = getSocialLinks();

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
                <Link href="/about">About</Link>
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
                <Link href="/track">Track your order</Link>
              </li>
              <li>
                <Link href="/shipping">Shipping &amp; returns</Link>
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
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of use</Link>
              </li>
            </ul>
          </div>
          {socialLinks.length > 0 && (
            <div className={styles.col}>
              <h3 className={styles.heading}>Follow us</h3>
              <ul className={styles.socialList}>
                {socialLinks.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className={styles.socialIcon} aria-hidden>
                        <FooterSocialIcon id={s.id} />
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
