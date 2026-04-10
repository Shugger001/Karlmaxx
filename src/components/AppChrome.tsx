"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import styles from "./AppChrome.module.css";

const CartDrawer = dynamic(
  () => import("./CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);
const FloatingActions = dynamic(
  () => import("./FloatingActions").then((m) => m.FloatingActions),
  { ssr: false },
);

function isAdminPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/admin"));
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);

  if (isAdminPath(pathname)) {
    return (
      <>
        <a href="#main-content" className={styles.skipLink}>
          Skip to admin content
        </a>
        <main id="main-content" className={styles.mainAdmin} tabIndex={-1}>
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Navbar onOpenCart={() => setCartOpen(true)} />
      {cartOpen ? (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      ) : null}
      <FloatingActions />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
