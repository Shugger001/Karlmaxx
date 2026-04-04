"use client";

import { useAdminData } from "@/context/AdminDataContext";
import { formatCedis } from "@/lib/currency";
import Link from "next/link";
import { useMemo } from "react";
import { categoryCounts } from "../adminUtils";
import s from "../adminShared.module.css";
import type { AdminViewId } from "../adminTypes";

const LOW_STOCK = 5;

export function OverviewView({
  onNavigate,
}: {
  onNavigate: (id: AdminViewId) => void;
}) {
  const { products, orders, profiles, loading } = useAdminData();

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const lowStock = products.filter((p) => p.stock <= LOW_STOCK && p.stock > 0);
    const outOfStock = products.filter((p) => p.stock === 0);
    const featured = products.filter((p) => p.featured).length;
    return {
      revenue,
      paidCount: paid.length,
      orderCount: orders.length,
      pending,
      productCount: products.length,
      customerCount: profiles.length,
      lowStock,
      outOfStock,
      featured,
      categories: categoryCounts(products.map((p) => p.category)),
    };
  }, [products, orders, profiles]);

  if (loading) {
    return <p className={s.msg}>Loading overview…</p>;
  }

  return (
    <div className={s.panel}>
      <h2 className={s.panelTitle}>Business snapshot</h2>
      <div className={s.statGrid}>
        <div className={s.statCard}>
          <div className={s.statValue}>{formatCedis(stats.revenue)}</div>
          <div className={s.statLabel}>Paid order revenue</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statValue}>{stats.paidCount}</div>
          <div className={s.statLabel}>Paid orders</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statValue}>{stats.pending}</div>
          <div className={s.statLabel}>Pending orders</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statValue}>{stats.productCount}</div>
          <div className={s.statLabel}>Products live</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statValue}>{stats.customerCount}</div>
          <div className={s.statLabel}>Customer accounts</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statValue}>{stats.featured}</div>
          <div className={s.statLabel}>Featured SKUs</div>
        </div>
      </div>

      <div style={{ marginTop: "1.75rem", display: "grid", gap: "1.25rem" }}>
        <div>
          <h3 className={s.panelTitle} style={{ marginBottom: "0.5rem" }}>
            Inventory alerts
          </h3>
          {stats.outOfStock.length > 0 && (
            <p className={s.msg}>
              <span className={s.badgeWarn}>{stats.outOfStock.length} out of stock</span>
              {" — "}
              <button
                type="button"
                className={s.btnGhost}
                style={{ padding: "0.35rem 0.55rem", fontSize: "0.65rem" }}
                onClick={() => onNavigate("products")}
              >
                Open products
              </button>
            </p>
          )}
          {stats.lowStock.length > 0 && (
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
              {stats.lowStock.slice(0, 6).map((p) => (
                <li key={p.id}>
                  {p.name} — {p.stock} left
                </li>
              ))}
              {stats.lowStock.length > 6 && (
                <li>…and {stats.lowStock.length - 6} more</li>
              )}
            </ul>
          )}
          {stats.outOfStock.length === 0 && stats.lowStock.length === 0 && (
            <p className={s.msg} style={{ color: "var(--muted)" }}>
              No low-stock warnings (threshold ≤{LOW_STOCK} units).
            </p>
          )}
        </div>

        <div>
          <h3 className={s.panelTitle} style={{ marginBottom: "0.5rem" }}>
            Catalog by category
          </h3>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                </tr>
              </thead>
              <tbody>
                {stats.categories.slice(0, 12).map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className={s.panelTitle} style={{ marginBottom: "0.5rem" }}>
            Recent orders
          </h3>
          {orders.length === 0 ? (
            <p className={s.msg} style={{ color: "var(--muted)" }}>
              No orders yet.
            </p>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt ?? 0).getTime() -
                        new Date(a.createdAt ?? 0).getTime(),
                    )
                    .slice(0, 8)
                    .map((o) => (
                      <tr key={o.id}>
                        <td className={s.mono}>
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {o.status === "paid" ? (
                            <span className={s.badgeOk}>paid</span>
                          ) : (
                            <span className={s.badgePending}>pending</span>
                          )}
                        </td>
                        <td>{formatCedis(o.total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className={s.btnGhost}
              onClick={() => onNavigate("orders")}
            >
              View all orders
            </button>
          </p>
        </div>

        <p className={s.msg} style={{ marginTop: "0.5rem" }}>
          <Link
            href="/"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Open storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
