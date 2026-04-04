"use client";

import { useAdminData } from "@/context/AdminDataContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCedis } from "@/lib/currency";
import type { Order, OrderStatus } from "@/types";
import { Fragment, useMemo, useState } from "react";
import { downloadTextFile, ordersToCsv } from "../adminUtils";
import s from "../adminShared.module.css";

type Filter = "all" | OrderStatus;

export function OrdersView() {
  const { orders, loading, refresh, supabaseReady } = useAdminData();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") {
      list = list.filter((o) => o.status === filter);
    }
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(needle) ||
          (o.paystackReference?.toLowerCase().includes(needle) ?? false) ||
          (o.userId?.toLowerCase().includes(needle) ?? false),
      );
    }
    return list;
  }, [orders, filter, q]);

  const exportCsv = () => {
    downloadTextFile(
      `orders-export-${new Date().toISOString().slice(0, 10)}.csv`,
      ordersToCsv(filtered),
    );
  };

  const setStatus = async (order: Order, status: OrderStatus) => {
    if (!supabaseReady || order.status === status) return;
    setBusyId(order.id);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order.id);
      if (error) throw error;
      setMsg({ ok: true, text: "Order updated." });
      await refresh();
    } catch {
      setMsg({
        ok: false,
        text: "Update failed. Run migration 006_admin_dashboard_rls.sql for admin order updates.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className={s.msg}>Loading orders…</p>;
  }

  return (
    <div className={s.panel}>
      <h2 className={s.panelTitle}>Orders &amp; fulfillment</h2>
      <div className={s.toolbar}>
        <input
          className={`${s.input} ${s.searchInput}`}
          type="search"
          placeholder="Search ID, Paystack ref, user…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={s.select}
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <button
          type="button"
          className={s.btnGhost}
          disabled={filtered.length === 0}
          onClick={exportCsv}
        >
          Export CSV ({filtered.length})
        </button>
      </div>
      {msg && (
        <p className={msg.ok ? s.msgOk : s.msgError}>{msg.text}</p>
      )}
      {filtered.length === 0 ? (
        <p className={s.msg} style={{ color: "var(--muted)" }}>
          No orders match.
        </p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Total</th>
                <th>Customer</th>
                <th>Items</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td className={s.mono} style={{ maxWidth: 120 }}>
                      {o.id.slice(0, 18)}
                      {o.id.length > 18 ? "…" : ""}
                    </td>
                    <td>
                      {o.status === "paid" ? (
                        <span className={s.badgeOk}>paid</span>
                      ) : (
                        <span className={s.badgePending}>pending</span>
                      )}
                    </td>
                    <td>{formatCedis(o.total)}</td>
                    <td className={s.mono}>{o.userId ?? "guest"}</td>
                    <td>
                      {o.items.slice(0, 2).map((i) => (
                        <div key={`${i.productId}-${i.color ?? ""}`}>
                          {i.name}
                          {i.color ? ` · ${i.color}` : ""} × {i.quantity}
                        </div>
                      ))}
                      {o.items.length > 2 && (
                        <div>+{o.items.length - 2} more</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        <button
                          type="button"
                          className={s.btnGhost}
                          style={{ padding: "0.35rem 0.5rem", fontSize: "0.62rem" }}
                          onClick={() =>
                            setExpanded((x) => (x === o.id ? null : o.id))
                          }
                        >
                          {expanded === o.id ? "Hide" : "Details"}
                        </button>
                        <select
                          className={s.select}
                          style={{ padding: "0.35rem", fontSize: "0.72rem", maxWidth: 110 }}
                          value={o.status}
                          disabled={!supabaseReady || busyId === o.id}
                          onChange={(e) =>
                            void setStatus(o, e.target.value as OrderStatus)
                          }
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className={s.orderDetail}>
                          <div>
                            <strong>Full ID:</strong>{" "}
                            <span className={s.mono}>{o.id}</span>
                          </div>
                          {o.paystackReference && (
                            <div>
                              <strong>Paystack ref:</strong>{" "}
                              <span className={s.mono}>{o.paystackReference}</span>
                            </div>
                          )}
                          <div>
                            <strong>Created:</strong>{" "}
                            {o.createdAt
                              ? new Date(o.createdAt).toLocaleString()
                              : "—"}
                          </div>
                          <div style={{ marginTop: "0.5rem" }}>
                            <strong>Line items</strong>
                            <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.2rem" }}>
                              {o.items.map((i) => (
                                <li key={`${i.productId}-${i.color ?? ""}-${i.name}`}>
                                  {i.name}
                                  {i.color ? ` (${i.color})` : ""} —{" "}
                                  {formatCedis(i.price)} × {i.quantity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
