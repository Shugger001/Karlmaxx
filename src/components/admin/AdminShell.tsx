"use client";

import { useAdminData } from "@/context/AdminDataContext";
import Link from "next/link";
import { useState } from "react";
import type { AdminViewId } from "./adminTypes";
import shell from "./AdminShell.module.css";
import { CustomersView } from "./views/CustomersView";
import { OrdersView } from "./views/OrdersView";
import { OverviewView } from "./views/OverviewView";
import { ProductsView } from "./views/ProductsView";
import { SystemView } from "./views/SystemView";

const NAV: {
  id: AdminViewId;
  label: string;
  hint: string;
}[] = [
  { id: "overview", label: "Overview", hint: "KPIs & snapshot" },
  { id: "products", label: "Products", hint: "Catalog & stock" },
  { id: "orders", label: "Orders", hint: "Sales & CSV" },
  { id: "customers", label: "Customers", hint: "Roles & accounts" },
  { id: "system", label: "System", hint: "Integrations" },
];

export function AdminShell() {
  const [view, setView] = useState<AdminViewId>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const { loading, error, products, orders, profiles } = useAdminData();

  return (
    <div className={shell.layout}>
      <aside className={`${shell.sidebar} ${mobileNav ? shell.sidebarOpen : ""}`}>
        <div className={shell.brand}>
          <Link href="/" className={shell.brandLink} onClick={() => setMobileNav(false)}>
            Karlmaxx
          </Link>
          <span className={shell.brandBadge}>Admin</span>
        </div>
        <p className={shell.sidebarSub}>Operations console</p>
        <nav className={shell.nav} aria-label="Admin sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${shell.navBtn} ${view === item.id ? shell.navBtnActive : ""}`}
              onClick={() => {
                setView(item.id);
                setMobileNav(false);
              }}
            >
              <span className={shell.navLabel}>{item.label}</span>
              <span className={shell.navHint}>{item.hint}</span>
            </button>
          ))}
        </nav>
        <div className={shell.sidebarFoot}>
          <Link href="/" className={shell.footLink} onClick={() => setMobileNav(false)}>
            ← Storefront
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
            <h1 className={shell.pageTitle}>
              {NAV.find((n) => n.id === view)?.label ?? "Admin"}
            </h1>
            <p className={shell.pageHint}>
              {loading
                ? "Syncing data…"
                : error
                  ? "Some data failed to load"
                  : `${products.length} products · ${orders.length} orders · ${profiles.length} accounts`}
            </p>
          </div>
        </header>

        {error && (
          <div className={shell.bannerErr} role="alert">
            {error}
          </div>
        )}

        <div className={shell.content}>
          {view === "overview" && <OverviewView onNavigate={setView} />}
          {view === "products" && <ProductsView />}
          {view === "orders" && <OrdersView />}
          {view === "customers" && <CustomersView />}
          {view === "system" && <SystemView />}
        </div>
      </div>
    </div>
  );
}
