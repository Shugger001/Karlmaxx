"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useShopSearch } from "@/context/ShopSearchContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./Navbar.module.css";

type NavbarProps = {
  onOpenCart: () => void;
};

function BrandMark({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M4 4h5.2l2.8 4.2L14.8 4H20l-5.45 8L20 20h-5.2L12 15.8 9.2 20H4l5.45-8L4 4z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function oauthAvatarUrl(user: { user_metadata?: Record<string, unknown> } | null): string | null {
  if (!user?.user_metadata) return null;
  const m = user.user_metadata;
  const a = m.avatar_url;
  const p = m.picture;
  if (typeof a === "string" && a.startsWith("https://")) return a;
  if (typeof p === "string" && p.startsWith("https://")) return p;
  return null;
}

function ClientProfileMark({
  label,
  initials,
  photoUrl,
  pixel,
  className,
}: {
  label: string;
  initials: string;
  photoUrl: string | null;
  pixel: number;
  className: string;
}) {
  return (
    <span
      className={className}
      style={{ width: pixel, height: pixel }}
      title={label}
      aria-label={label}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt=""
          fill
          sizes={`${pixel}px`}
          className={`${styles.profilePhoto} photo-surface-motion-subtle`}
        />
      ) : (
        initials
      )}
    </span>
  );
}

export function Navbar({ onOpenCart }: NavbarProps) {
  const { itemCount } = useCart();
  const { user, profile, isAdmin, logout } = useAuth();
  const { query, setQuery } = useShopSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const profileLabel =
    profile?.displayName?.trim() ||
    profile?.email?.trim() ||
    user?.email ||
    "Client";
  const initials =
    profileLabel
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "C";

  const photoUrl = useMemo(() => oauthAvatarUrl(user), [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    const q = query.trim();
    if (pathname !== "/") {
      if (q) {
        router.push(`/?q=${encodeURIComponent(q)}#collection`);
      } else {
        router.push("/#collection");
      }
      return;
    }
    if (q) {
      router.replace(`/?q=${encodeURIComponent(q)}`);
    } else {
      router.replace("/");
    }
    document
      .getElementById("collection")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className={`${styles.shell} ${scrolled ? styles.shellScrolled : ""}`}>
      <div className={styles.topBar}>
        <div className={styles.row}>
          <Link
            href="/"
            prefetch={false}
            className={styles.brand}
            onClick={() => setMenuOpen(false)}
          >
            <BrandMark className={styles.brandMark} />
            <span className={styles.brandMain}>Karlmaxx</span>
            <span className={styles.brandSub}>Investment Limited</span>
          </Link>

          <form
            className={styles.searchForm}
            onSubmit={onSearchSubmit}
            role="search"
          >
            <label className={styles.srOnly} htmlFor="site-search">
              Search products
            </label>
            <input
              id="site-search"
              type="search"
              className={styles.searchInput}
              placeholder="Search Karlmaxx"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Go">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
            </button>
          </form>

          <div className={styles.rowActions}>
            <div className={styles.accountCluster} aria-label="Account">
              {user ? (
                <>
                  <ClientProfileMark
                    label={profileLabel}
                    initials={initials}
                    photoUrl={photoUrl}
                    pixel={30}
                    className={styles.profileLogo}
                  />
                  {isAdmin && (
                    <Link
                      href="/admin"
                      prefetch={false}
                      className={styles.topLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className={styles.topLinkBtn}
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    prefetch={false}
                    className={styles.topLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    prefetch={false}
                    className={styles.topSignUp}
                    onClick={() => setMenuOpen(false)}
                  >
                    Join
                  </Link>
                </>
              )}
            </div>

            {user && (
              <ClientProfileMark
                label={profileLabel}
                initials={initials}
                photoUrl={photoUrl}
                pixel={30}
                className={styles.profileLogoMobile}
              />
            )}

            <button
              type="button"
              className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ""}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>

            <button
              type="button"
              className={styles.cartBtn}
              aria-label="Open cart"
              onClick={() => {
                setMenuOpen(false);
                onOpenCart();
              }}
            >
              <div className={styles.cartInner}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="20" r="1" fill="currentColor" />
                  <circle cx="18" cy="20" r="1" fill="currentColor" />
                </svg>
                <span className={styles.cartLabel}>Cart</span>
              </div>
              {itemCount > 0 && (
                <span key={itemCount} className={styles.badge}>
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <nav
        className={`${styles.subNav} ${menuOpen ? styles.subNavOpen : ""}`}
        aria-label="Main"
      >
        <div className={styles.subInner}>
          {user && (
            <div className={styles.subProfile}>
              <ClientProfileMark
                label={profileLabel}
                initials={initials}
                photoUrl={photoUrl}
                pixel={40}
                className={styles.subProfileLogo}
              />
              <div className={styles.subProfileMeta}>
                <span className={styles.subProfileName}>{profileLabel}</span>
                {isAdmin && (
                  <span className={styles.subProfileBadge}>Admin</span>
                )}
              </div>
            </div>
          )}
          <Link href="/" prefetch={false} className={styles.subLink} onClick={() => setMenuOpen(false)}>
            Shop all
          </Link>
          <Link
            href="/about"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/faq"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>
          <Link
            href="/shipping"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            Shipping
          </Link>
          <Link
            href="/terms"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            Terms
          </Link>
          <Link
            href="/track"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            Track order
          </Link>
          <Link
            href="/checkout"
            prefetch={false}
            className={styles.subLink}
            onClick={() => setMenuOpen(false)}
          >
            Checkout
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  prefetch={false}
                  className={styles.subLink}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                className={styles.subLinkBtn}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                }}
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                prefetch={false}
                className={styles.subLink}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                prefetch={false}
                className={styles.subLink}
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
