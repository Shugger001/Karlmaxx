"use client";

import { useState, type ReactNode } from "react";
import { CartDrawer } from "./CartDrawer";
import { FloatingActions } from "./FloatingActions";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import styles from "./AppChrome.module.css";

export function AppChrome({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

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
