"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CartDrawer } from "./CartDrawer";
import { FloatingActions } from "./FloatingActions";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import styles from "./AppChrome.module.css";

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
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FloatingActions />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
