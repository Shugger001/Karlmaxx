"use client";

import { useAuth } from "@/context/AuthContext";
import { useAdminData } from "@/context/AdminDataContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { AdminViewId } from "./adminTypes";
import { ADMIN_SECTION_HREF } from "./adminTypes";
import shell from "./AdminShell.module.css";

const NAV: {
  id: AdminViewId;
  label: string;
  hint: string;
}[] = [
  { id: "overview", label: "Overview", hint: "KPIs & snapshot" },
  { id: "products", label: "Products", hint: "Bulk, duplicate & CSV" },
   { id: "orders", label: "Orders", hint: "Fulfillment, notes & CSV" },
  { id: "customers", label: "Customers", hint: "Roles & accounts" },
  { id: "system", label: "System", hint: "Integrations" },
];

function AdminUserRail() {
  const { profile, user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const email = profile?.email ?? user?.email ?? "Administrator";

  return (
    <div className={shell.userRail}>
      <span className={shell.privilegeBadge} title="Privileged session">
        Privileged
      </span>
      <span className={shell.userEmail} title={email}>
        {email}
      </span>
      <button
        type="button"
        className={shell.signOut}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await logout();
          } finally {
            setBusy(false);
          }
        }}
      >
        Sign out
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const { loading, error, products, orders, profiles } = useAdminData();

  const active = NAV.find((n) => pathname === ADMIN_SECTION_HREF[n.id]);

  return (
    <div className={shell.layout}>
      <aside className={`${shell.sidebar} ${mobileNav ? shell.sidebarOpen : ""}`}>
        <div className={shell.brand}>
          <div className={shell.brandStack}>
            <Link href="/" className={shell.brandLink} onClick={() => setMobileNav(false)}>
              Karlmaxx
            </Link>
            <span className={shell.privateMark}>Private suite</span>
          </div>
          <span className={shell.brandBadge}>Admin</span>
        </div>
        <p className={shell.sidebarSub}>Investment Limited · internal operations</p>
        <nav className={shell.nav} aria-label="Admin sections">
          {NAV.map((item) => {
            const href = ADMIN_SECTION_HREF[item.id];
            const isActive = pathname === href;
            return (
              <Link
                key={item.id}
                href={href}
                className={`${shell.navBtn} ${isActive ? shell.navBtnActive : ""}`}
                onClick={() => setMobileNav(false)}
              >
                <span className={shell.navLabel}>{item.label}</span>
                <span className={shell.navHint}>{item.hint}</span>
              </Link>
            );
          })}
        </nav>
        <div className={shell.sidebarFoot}>
          <Link href="/" className={shell.footLink} onClick={() => setMobileNav(false)}>
            ← Exit to storefront
          </Link>
        </div>
      </aside>

      {mobileNav && (
        <button
          type="button"
          className={shell.scrim}
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}

      <div className={shell.main}>
        <header className={shell.topbar}>
          <button
            type="button"
            className={shell.menuBtn}
            aria-expanded={mobileNav}
            onClick={() => setMobileNav((o) => !o)}
          >
            Menu
          </button>
          <div className={shell.topbarTitle}>
            <p className={shell.suiteEyebrow}>Karlmaxx private dashboard</p>
            <h1 className={shell.pageTitle}>{active?.label ?? "Admin"}</h1>
            <p className={shell.pageHint}>
              {loading
                ? "Syncing secure data…"
                : error
                  ? "Some data failed to load"
                  : `${products.length} products · ${orders.length} orders · ${profiles.length} accounts`}
            </p>
          </div>
          <AdminUserRail />
        </header>

        {error && (
          <div className={shell.bannerErr} role="alert">
            {error}
          </div>
        )}

        <div className={shell.content}>{children}</div>
      </div>
    </div>
  );
}
