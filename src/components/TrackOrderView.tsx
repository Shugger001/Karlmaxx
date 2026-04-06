"use client";

import type { FulfillmentStage } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./TrackOrderView.module.css";

type TimelineEntry = {
  stage: FulfillmentStage;
  label: string;
  done: boolean;
  current: boolean;
};

type TrackOrderResponse = {
  ok: boolean;
  error?: string;
  order?: {
    id: string;
    total: number;
    paymentStatus: string;
    fulfillmentStage: FulfillmentStage;
    fulfillmentLabel: string;
    carrier: string | null;
    trackingNumber: string | null;
    createdAt: string | null;
    items: { name: string; quantity: number; color?: string }[];
    timeline: TimelineEntry[];
  };
};

export function TrackOrderView() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"ref" | "token">("ref");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TrackOrderResponse | null>(null);

  useEffect(() => {
    const t = searchParams.get("token")?.trim();
    if (t) {
      setToken(t);
      setMode("token");
    }
  }, [searchParams]);

  const submit = useCallback(async () => {
    setBusy(true);
    setResult(null);
    try {
      const body =
        mode === "token"
          ? { token: token.trim() }
          : { orderId: orderId.trim(), email: email.trim() };
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as TrackOrderResponse;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }, [mode, orderId, email, token]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Track your order</h1>
        <p className={styles.lead}>
          Enter the order reference from your receipt and the email you used at
          checkout — like major retailers — or paste a tracking token from
          support.
        </p>
      </header>

      <div className={styles.panel}>
        <div className={styles.modeRow} role="tablist" aria-label="Lookup method">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "ref"}
            className={`${styles.modeBtn} ${mode === "ref" ? styles.modeBtnActive : ""}`}
            onClick={() => setMode("ref")}
          >
            Reference + email
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "token"}
            className={`${styles.modeBtn} ${mode === "token" ? styles.modeBtnActive : ""}`}
            onClick={() => setMode("token")}
          >
            Tracking token
          </button>
        </div>

        {mode === "ref" ? (
          <div className={styles.fields}>
            <label className={styles.label}>
              <span>Order reference</span>
              <input
                className={styles.input}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. kmx_1730…"
                autoComplete="off"
              />
            </label>
            <label className={styles.label}>
              <span>Email</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
          </div>
        ) : (
          <label className={styles.label}>
            <span>Tracking token</span>
            <input
              className={styles.input}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from email or admin"
              autoComplete="off"
            />
          </label>
        )}

        <button
          type="button"
          className={styles.submit}
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy ? "Looking up…" : "Track order"}
        </button>

        {result && !result.ok && (
          <p className={styles.error} role="alert">
            {result.error}
          </p>
        )}

        {result?.ok && result.order && (
          <div className={styles.outcome}>
            <div className={styles.orderHead}>
              <div>
                <p className={styles.refLabel}>Order reference</p>
                <p className={styles.refValue}>{result.order.id}</p>
              </div>
              <div className={styles.meta}>
                <span>
                  Payment: <strong>{result.order.paymentStatus}</strong>
                </span>
                <span>
                  Total:{" "}
                  <strong>
                    {new Intl.NumberFormat("en-GH", {
                      style: "currency",
                      currency: "GHS",
                    }).format(result.order.total)}
                  </strong>
                </span>
              </div>
            </div>

            <section className={styles.timeline} aria-label="Shipment progress">
              <h2 className={styles.timelineTitle}>Shipment progress</h2>
              <ol className={styles.steps}>
                {result.order.timeline.map((step) => (
                  <li
                    key={step.stage}
                    className={`${styles.step} ${step.current ? styles.stepCurrent : ""} ${step.done ? styles.stepDone : ""}`}
                  >
                    <span className={styles.stepDot} aria-hidden />
                    <div>
                      <p className={styles.stepLabel}>{step.label}</p>
                      {step.current && (
                        <p className={styles.stepHint}>Current status</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {(result.order.carrier || result.order.trackingNumber) && (
              <div className={styles.carrierBox}>
                <h3 className={styles.carrierTitle}>Carrier details</h3>
                {result.order.carrier && (
                  <p>
                    <span className={styles.muted}>Carrier:</span>{" "}
                    {result.order.carrier}
                  </p>
                )}
                {result.order.trackingNumber && (
                  <p>
                    <span className={styles.muted}>Tracking #:</span>{" "}
                    <span className={styles.mono}>{result.order.trackingNumber}</span>
                  </p>
                )}
              </div>
            )}

            <div className={styles.items}>
              <h3 className={styles.itemsTitle}>Items</h3>
              <ul>
                {result.order.items.map((i) => (
                  <li key={`${i.name}-${i.quantity}-${i.color ?? ""}`}>
                    {i.name}
                    {i.color ? ` · ${i.color}` : ""} × {i.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <p className={styles.footNote}>
              Progress updates when our team advances your shipment. Carrier details
              appear here once dispatched.
            </p>
          </div>
        )}
      </div>

      <p className={styles.back}>
        <Link href="/">← Back to shop</Link>
      </p>
    </div>
  );
}
