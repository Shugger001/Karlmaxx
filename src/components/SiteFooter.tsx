"use client";

import { getSocialLinks } from "@/lib/siteSocial";
import Link from "next/link";
import { useMemo } from "react";
import { FooterSocialIcon } from "./FooterSocialIcon";
import styles from "./SiteFooter.module.css";

const COPYRIGHT_YEAR = 2026;

function BrandMark({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path
          d="M4 4h5.2l2.8 4.2L14.8 4H20l-5.45 8L20 20h-5.2L12 15.8 9.2 20H4l5.45-8L4 4z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function TrustIcon({ id }: { id: "pickup" | "returns" | "support" | "secure" }) {
  switch (id) {
    case "pickup":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 9.5 12 4l8 5.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 12h8M8 15h8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "returns":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 7h12M7 7l3-3M7 7l3 3M17 17H5m12 0-3-3m3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "support":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 12a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-5h4M4 12v5h4v-5H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 20h2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "secure":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3 19 6v6c0 4.2-2.9 8-7 9-4.1-1-7-4.8-7-9V6l7-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m9.4 12.4 1.8 1.8 3.4-3.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function SiteFooter() {
  const socialLinks = useMemo(() => getSocialLinks(), []);
  const trustItems = [
    { id: "pickup" as const, title: "Free Store Pickup", subtitle: "Pick up at our store" },
    { id: "returns" as const, title: "Easy Returns", subtitle: "30-day return policy" },
    { id: "support" as const, title: "24/7 Support", subtitle: "Dedicated service" },
    { id: "secure" as const, title: "Secure Payment", subtitle: "Safe checkout" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <section className={styles.trustRow} aria-label="Why shop with us">
          {trustItems.map((item) =>
            item.id === "returns" ? (
              <Link key={item.id} href="/returns" className={styles.trustItemLink}>
                <article className={styles.trustItem}>
                  <span className={styles.trustIcon} aria-hidden>
                    <TrustIcon id={item.id} />
                  </span>
                  <h3 className={styles.trustTitle}>{item.title}</h3>
                  <p className={styles.trustSub}>{item.subtitle}</p>
                </article>
              </Link>
            ) : (
              <article key={item.id} className={styles.trustItem}>
                <span className={styles.trustIcon} aria-hidden>
                  <TrustIcon id={item.id} />
                </span>
                <h3 className={styles.trustTitle}>{item.title}</h3>
                <p className={styles.trustSub}>{item.subtitle}</p>
              </article>
            ),
          )}
        </section>

        <section className={styles.communityPanel} aria-label="Join our community">
          <p className={styles.communityIcon} aria-hidden>
            ✦
          </p>
          <h2 className={styles.communityTitle}>Join Our Community</h2>
          <p className={styles.communitySub}>
            Get updates on new arrivals, exclusive deals, and latest collections.
          </p>
          <form className={styles.communityForm} action="/signup" method="get">
            <label htmlFor="footer-email" className={styles.srOnly}>
              Email address
            </label>
            <input
              id="footer-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              className={styles.communityInput}
            />
            <button type="submit" className={styles.communityButton}>
              Join
            </button>
          </form>
        </section>

        <div className={styles.columns}>
          <div className={styles.colBrand}>
            <p className={styles.brand}>
              <BrandMark className={styles.brandMark} />
              Karlmaxx
            </p>
            <p className={styles.brandBlurb}>
              Premium quality products curated for modern everyday living.
            </p>
            {socialLinks.length > 0 && (
              <ul className={styles.socialInline}>
                {socialLinks.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      className={styles.socialBadge}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                    >
                      <FooterSocialIcon id={s.id} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>Shop</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/#collection" prefetch={false}>Shop all</Link>
              </li>
              <li>
                <Link href="/#categories" prefetch={false}>Categories</Link>
              </li>
              <li>
                <Link href="/#collection" prefetch={false}>New arrivals</Link>
              </li>
              <li>
                <Link href="/#collection" prefetch={false}>Best sellers</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>Customer Care</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/contact" prefetch={false}>Contact us</Link>
              </li>
              <li>
                <Link href="/track" prefetch={false}>Track my order</Link>
              </li>
              <li>
                <Link href="/shipping" prefetch={false}>Shipping info</Link>
              </li>
              <li>
                <Link href="/returns" prefetch={false}>Returns &amp; refunds</Link>
              </li>
              <li>
                <Link href="/login" prefetch={false}>Your account</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.heading}>Company</h3>
            <ul className={styles.list}>
              <li>
                <Link href="/about" prefetch={false}>Our story</Link>
              </li>
              <li>
                <Link href="/faq" prefetch={false}>FAQ</Link>
              </li>
              <li>
                <Link href="/privacy" prefetch={false}>Privacy policy</Link>
              </li>
              <li>
                <Link href="/terms" prefetch={false}>Terms of service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {COPYRIGHT_YEAR} Karlmaxx Investment Limited. All rights reserved.
          </p>
          <p className={styles.copy}>
            Secure checkout powered by Paystack.
          </p>
        </div>
      </div>
    </footer>
  );
}
