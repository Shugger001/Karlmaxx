"use client";

import { useAdminData } from "@/context/AdminDataContext";
import { FULFILLMENT_LABELS, FULFILLMENT_STAGES } from "@/lib/fulfillment";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCedis } from "@/lib/currency";
import type { FulfillmentStage, Order, OrderStatus } from "@/types";
import { Fragment, useEffect, useMemo, useState } from "react";
import { downloadTextFile, ordersToCsv } from "../adminUtils";
import s from "../adminShared.module.css";

/** Quick views: payment + fulfillment presets for faster triage. */
type OrderPreset =
  | "all"
  | "pending_pay"
  | "paid_all"
  | "paid_open"
  | "in_transit"
  | "delivered_only";

export function OrdersView() {
  const { orders, loading, refresh, supabaseReady, error: loadError } = useAdminData();
  const [preset, setPreset] = useState<OrderPreset>("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [fulfillmentDraft, setFulfillmentDraft] = useState<{
    stage: FulfillmentStage;
    carrier: string;
    trackingNumber: string;
  } | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkStage, setBulkStage] = useState<FulfillmentStage>("shipped");

  useEffect(() => {
    setSelectedIds(new Set());
  }, [preset, q]);

  useEffect(() => {
    if (!expanded) {
      setFulfillmentDraft(null);
      setNotesDraft("");
      return;
    }
    const o = orders.find((x) => x.id === expanded);
    if (o) {
      setFulfillmentDraft({
        stage: o.fulfillmentStage,
        carrier: o.carrier ?? "",
        trackingNumber: o.trackingNumber ?? "",
      });
      setNotesDraft(o.adminNotes ?? "");
    }
  }, [expanded, orders]);

  const filtered = useMemo(() => {
    let list = orders;
    switch (preset) {
      case "pending_pay":
        list = list.filter((o) => o.status === "pending");
        break;
      case "paid_all":
        list = list.filter((o) => o.status === "paid");
        break;
      case "paid_open":
        list = list.filter(
          (o) => o.status === "paid" && o.fulfillmentStage !== "delivered",
        );
        break;
      case "in_transit":
        list = list.filter(
          (o) =>
            o.status === "paid" &&
            (o.fulfillmentStage === "shipped" ||
              o.fulfillmentStage === "out_for_delivery"),
        );
        break;
      case "delivered_only":
        list = list.filter(
          (o) => o.status === "paid" && o.fulfillmentStage === "delivered",
        );
        break;
      default:
        break;
    }
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(needle) ||
          (o.paystackReference?.toLowerCase().includes(needle) ?? false) ||
          (o.userId?.toLowerCase().includes(needle) ?? false) ||
          (o.customerEmail?.toLowerCase().includes(needle) ?? false) ||
          (o.trackingNumber?.toLowerCase().includes(needle) ?? false) ||
          (o.adminNotes?.toLowerCase().includes(needle) ?? false),
      );
    }
    return list;
  }, [orders, preset, q]);

  const selectedInView = useMemo(
    () => filtered.filter((o) => selectedIds.has(o.id)),
    [filtered, selectedIds],
  );
  const selectedPending = useMemo(
    () => selectedInView.filter((o) => o.status === "pending"),
    [selectedInView],
  );
  const selectedPaid = useMemo(
    () => selectedInView.filter((o) => o.status === "paid"),
    [selectedInView],
  );
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds(() =>
      allFilteredSelected ? new Set() : new Set(filtered.map((o) => o.id)),
    );
  };

  const bulkMarkPaid = async () => {
    if (!supabaseReady || selectedPending.length === 0) return;
    setBulkBusy(true);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      for (const o of selectedPending) {
        const { error } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", o.id);
        if (error) throw error;
      }
      setMsg({
        ok: true,
        text: `Marked ${selectedPending.length} order(s) as paid.`,
      });
      setSelectedIds(new Set());
      await refresh();
    } catch {
      setMsg({
        ok: false,
        text: "Bulk payment update failed. Refresh and check RLS.",
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkApplyFulfillmentStage = async () => {
    if (!supabaseReady || selectedPaid.length === 0) return;
    setBulkBusy(true);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      for (const o of selectedPaid) {
        const { error } = await supabase
          .from("orders")
          .update({ fulfillment_stage: bulkStage })
          .eq("id", o.id);
        if (error) throw error;
      }
      setMsg({
        ok: true,
        text: `Updated fulfillment to “${FULFILLMENT_LABELS[bulkStage]}” for ${selectedPaid.length} paid order(s). Carrier / tracking unchanged.`,
      });
      setSelectedIds(new Set());
      await refresh();
    } catch {
      setMsg({
        ok: false,
        text: "Bulk fulfillment update failed. Refresh and check RLS.",
      });
    } finally {
      setBulkBusy(false);
    }
  };

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

  const saveAdminNotes = async (order: Order) => {
    if (!supabaseReady) return;
    const nextVal = notesDraft.trim() || null;
    setBusyId(order.id);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("orders")
        .update({ admin_notes: nextVal })
        .eq("id", order.id);
      if (error) throw error;
      setMsg({ ok: true, text: "Notes saved." });
      await refresh();
    } catch {
      setMsg({
        ok: false,
        text: "Could not save notes. Run migration 012_order_admin_notes.sql and check admin RLS.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const saveFulfillment = async (order: Order) => {
    if (!supabaseReady || !fulfillmentDraft) return;
    setBusyId(order.id);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("orders")
        .update({
          fulfillment_stage: fulfillmentDraft.stage,
          carrier: fulfillmentDraft.carrier.trim() || null,
          tracking_number: fulfillmentDraft.trackingNumber.trim() || null,
        })
        .eq("id", order.id);
      if (error) throw error;
      setMsg({ ok: true, text: "Fulfillment updated." });
      await refresh();
    } catch {
      setMsg({
        ok: false,
        text: "Fulfillment update failed. Check migration 011 and admin RLS.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className={s.msg}>Loading orders…</p>;
  }

  const expandedOrder = expanded ? orders.find((x) => x.id === expanded) : null;
  const notesDirty =
    Boolean(expandedOrder) &&
    notesDraft.trim() !== (expandedOrder?.adminNotes?.trim() ?? "");

  return (
    <div className={s.panel}>
      <h2 className={s.panelTitle}>Orders &amp; fulfillment</h2>
      {loadError && (
        <p className={s.msgError} role="alert">
          {loadError}
        </p>
      )}
      <div className={s.toolbar}>
        <input
          className={`${s.input} ${s.searchInput}`}
          type="search"
          placeholder="Search ID, Paystack ref, email, tracking, notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={s.select}
          value={preset}
          onChange={(e) => setPreset(e.target.value as OrderPreset)}
          title="Quick views combine payment and fulfillment"
          aria-label="Order quick view"
        >
          <option value="all">All orders</option>
          <option value="pending_pay">Pending payment</option>
          <option value="paid_all">Paid — any stage</option>
          <option value="paid_open">Paid — not delivered yet</option>
          <option value="in_transit">Paid — in transit</option>
          <option value="delivered_only">Paid — delivered</option>
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
      {filtered.length > 0 && (
        <div
          className={s.toolbar}
          style={{
            marginTop: "-0.35rem",
            paddingTop: "0.65rem",
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.72rem", color: "var(--muted)", marginRight: "0.25rem" }}>
            Bulk ({selectedIds.size} selected):
          </span>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={allFilteredSelected}
              disabled={bulkBusy || !supabaseReady}
              onChange={toggleSelectAllFiltered}
              aria-label="Select all orders in this list"
            />
            <span style={{ fontSize: "0.75rem" }}>All in view</span>
          </label>
          <button
            type="button"
            className={s.btnGhost}
            disabled={
              bulkBusy ||
              !supabaseReady ||
              selectedPending.length === 0
            }
            onClick={() => void bulkMarkPaid()}
            title="Only applies to selected rows that are still pending payment"
          >
            Mark paid ({selectedPending.length})
          </button>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <select
              className={s.select}
              style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }}
              value={bulkStage}
              disabled={bulkBusy || !supabaseReady || selectedPaid.length === 0}
              onChange={(e) => setBulkStage(e.target.value as FulfillmentStage)}
              aria-label="Fulfillment stage for bulk update"
            >
              {FULFILLMENT_STAGES.map((st) => (
                <option key={st} value={st}>
                  {FULFILLMENT_LABELS[st]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={s.btnGhost}
              disabled={bulkBusy || !supabaseReady || selectedPaid.length === 0}
              onClick={() => void bulkApplyFulfillmentStage()}
              title="Only applies to selected rows that are already paid"
            >
              Set stage ({selectedPaid.length})
            </button>
          </label>
        </div>
      )}
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
                <th style={{ width: 36 }} aria-label="Select" />
                <th>Order</th>
                <th>Pay</th>
                <th>Ship</th>
                <th>Notes</th>
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
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(o.id)}
                        disabled={bulkBusy || !supabaseReady}
                        onChange={() => toggleRowSelected(o.id)}
                        aria-label={`Select order ${o.id.slice(0, 8)}…`}
                      />
                    </td>
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
                    <td>
                      <span
                        className={s.badgeMuted}
                        title={FULFILLMENT_LABELS[o.fulfillmentStage]}
                      >
                        {o.fulfillmentStage.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      {o.adminNotes?.trim() ? (
                        <span
                          className={s.badgeInternalNote}
                          title={o.adminNotes.trim().slice(0, 500)}
                        >
                          note
                        </span>
                      ) : (
                        <span style={{ color: "var(--muted-faint)", fontSize: "0.72rem" }}>
                          —
                        </span>
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
                          disabled={bulkBusy}
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
                          disabled={!supabaseReady || busyId === o.id || bulkBusy}
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
                  {expanded === o.id && fulfillmentDraft && (
                    <tr>
                      <td colSpan={9}>
                        <div className={s.orderDetail}>
                          <div>
                            <strong>Full ID:</strong>{" "}
                            <span className={s.mono}>{o.id}</span>
                          </div>
                          {o.customerEmail && (
                            <div>
                              <strong>Checkout email:</strong>{" "}
                              <span className={s.mono}>{o.customerEmail}</span>
                            </div>
                          )}
                          {o.trackingToken && (
                            <div>
                              <strong>Tracking token:</strong>{" "}
                              <span className={s.mono}>{o.trackingToken}</span>{" "}
                              <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                                (customer: /track?token=… or paste in Track page)
                              </span>
                            </div>
                          )}
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
                          <div
                            style={{
                              marginTop: "0.85rem",
                              padding: "0.75rem",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              display: "grid",
                              gap: "0.65rem",
                              maxWidth: 420,
                            }}
                          >
                            <strong>Fulfillment (customer tracking)</strong>
                            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                                Stage
                              </span>
                              <select
                                className={s.select}
                                value={fulfillmentDraft.stage}
                                disabled={busyId === o.id || bulkBusy}
                                onChange={(e) =>
                                  setFulfillmentDraft((d) =>
                                    d
                                      ? {
                                          ...d,
                                          stage: e.target.value as FulfillmentStage,
                                        }
                                      : d,
                                  )
                                }
                              >
                                {FULFILLMENT_STAGES.map((st) => (
                                  <option key={st} value={st}>
                                    {FULFILLMENT_LABELS[st]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                                Carrier
                              </span>
                              <input
                                className={s.input}
                                value={fulfillmentDraft.carrier}
                                disabled={busyId === o.id || bulkBusy}
                                placeholder="e.g. FedEx, GIG"
                                onChange={(e) =>
                                  setFulfillmentDraft((d) =>
                                    d ? { ...d, carrier: e.target.value } : d,
                                  )
                                }
                              />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                                Tracking number
                              </span>
                              <input
                                className={s.input}
                                value={fulfillmentDraft.trackingNumber}
                                disabled={busyId === o.id || bulkBusy}
                                onChange={(e) =>
                                  setFulfillmentDraft((d) =>
                                    d ? { ...d, trackingNumber: e.target.value } : d,
                                  )
                                }
                              />
                            </label>
                            <button
                              type="button"
                              className={s.btnGhost}
                              style={{ justifySelf: "start" }}
                              disabled={busyId === o.id || !supabaseReady || bulkBusy}
                              onClick={() => void saveFulfillment(o)}
                            >
                              Save fulfillment
                            </button>
                          </div>
                          <div
                            style={{
                              marginTop: "0.85rem",
                              padding: "0.75rem",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              maxWidth: 520,
                            }}
                          >
                            <strong>Internal notes</strong>
                            <p
                              style={{
                                margin: "0.35rem 0 0.5rem",
                                fontSize: "0.72rem",
                                color: "var(--muted)",
                              }}
                            >
                              Staff only — not shown to customers or on tracking.
                            </p>
                            {notesDirty && (
                              <p
                                style={{
                                  margin: "0 0 0.45rem",
                                  fontSize: "0.72rem",
                                  color: "var(--gold-dim)",
                                  fontWeight: 600,
                                }}
                              >
                                Unsaved changes
                              </p>
                            )}
                            <textarea
                              className={s.input}
                              rows={4}
                              value={notesDraft}
                              disabled={busyId === o.id || !supabaseReady || bulkBusy}
                              placeholder="e.g. called customer, reship Tuesday…"
                              onChange={(e) => setNotesDraft(e.target.value)}
                              style={{
                                width: "100%",
                                resize: "vertical",
                                minHeight: "4.5rem",
                                fontFamily: "inherit",
                                lineHeight: 1.45,
                              }}
                            />
                            <div
                              style={{
                                marginTop: "0.5rem",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                                alignItems: "center",
                              }}
                            >
                              <button
                                type="button"
                                className={s.btnGhost}
                                disabled={
                                  busyId === o.id ||
                                  !supabaseReady ||
                                  !notesDirty ||
                                  bulkBusy
                                }
                                onClick={() => void saveAdminNotes(o)}
                              >
                                Save notes
                              </button>
                              <button
                                type="button"
                                className={s.btnGhost}
                                disabled={busyId === o.id || !notesDirty || bulkBusy}
                                onClick={() => setNotesDraft(o.adminNotes ?? "")}
                              >
                                Discard
                              </button>
                            </div>
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
