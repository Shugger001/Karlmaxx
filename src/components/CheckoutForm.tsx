"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCedis } from "@/lib/currency";
import { getClientPaymentUi, startClientPayment } from "@/lib/payments/client";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import styles from "./CheckoutForm.module.css";

export function CheckoutForm() {
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const formId = useId();
  const [fullName, setFullName] = useState(profile?.displayName ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidRef, setPaidRef] = useState<string | null>(null);
  const [paidTrackToken, setPaidTrackToken] = useState<string | null>(null);

  useEffect(() => {
    setFullName((n) => n || (profile?.displayName ?? ""));
    setEmail((e) => e || (profile?.email ?? user?.email ?? ""));
  }, [profile?.displayName, profile?.email, user?.email]);

  const paymentUi = getClientPaymentUi();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  const openWhatsApp = useCallback(() => {
    if (!whatsappNumber || items.length === 0) return;
    const lines = items.map(
      (i) =>
        `• ${i.name}${i.color ? ` (${i.color})` : ""} × ${i.quantity} — ${formatCedis(i.price * i.quantity)}`,
    );
    const text = [
      `New order inquiry — ${fullName || "Guest"}`,
      "",
      ...lines,
      "",
      `Total: ${formatCedis(subtotal)}`,
      email ? `Email: ${email}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [whatsappNumber, items, fullName, subtotal, email]);

  const payWithProvider = useCallback(async () => {
    setError(null);
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required for card payment.");
      return;
    }
    if (!paymentUi.configured) {
      setError(`${paymentUi.label} is not configured.`);
      return;
    }
    setBusy(true);
    try {
      await startClientPayment({
        amountCedis: subtotal,
        email: email.trim(),
        fullName,
        items,
        userId: user?.id ?? null,
        onSuccess: async (response) => {
          setBusy(true);
          try {
            const res = await fetch("/api/paystack/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                items,
                userId: user?.id ?? null,
                customerEmail: email.trim(),
              }),
            });
            const data = (await res.json()) as {
              ok?: boolean;
              error?: string;
              orderId?: string;
              trackingToken?: string;
            };
            if (!res.ok || !data.ok) {
              setError(data.error ?? "Payment verification failed.");
              setBusy(false);
              return;
            }
            setPaidRef(data.orderId ?? response.reference);
            setPaidTrackToken(data.trackingToken?.trim() || null);
            clearCart();
          } catch {
            setError("Verification request failed.");
          } finally {
            setBusy(false);
          }
        },
        onClose: () => {
          setBusy(false);
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message) {
        setError(message);
      } else {
      setError("Could not start checkout.");
      }
      setBusy(false);
    }
  }, [items, email, paymentUi.configured, paymentUi.label, subtotal, fullName, user?.id, clearCart]);

  if (paidRef) {
    return (
      <div className={styles.success}>
        <p>Thank you. Your payment was successful.</p>
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", opacity: 0.85 }}>
          Order reference: <strong>{paidRef}</strong>
        </p>
        <p style={{ marginTop: "0.65rem", fontSize: "0.85rem", opacity: 0.85 }}>
          Track delivery with your reference and the email you used at checkout.
        </p>
        <div className={styles.trackActions}>
          <Link href="/track" className={styles.trackLink}>
            Track your order
          </Link>
          {paidTrackToken ? (
            <Link
              href={`/track?token=${encodeURIComponent(paidTrackToken)}`}
              className={styles.trackLinkSecondary}
            >
              Open private tracking link
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.form}>
        <p className={styles.hint}>
          {user
            ? "Signed in — you can complete payment or message us on WhatsApp."
            : "Guest checkout is available. Sign in anytime to save your profile."}
        </p>
        <label className={styles.label} htmlFor={`${formId}-name`}>
          <span>Full name</span>
          <input
            id={`${formId}-name`}
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className={styles.label} htmlFor={`${formId}-email`}>
          <span>Email</span>
          <input
            id={`${formId}-email`}
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.payBtn}
            disabled={busy || items.length === 0}
            onClick={() => void payWithProvider()}
          >
            {busy ? "Processing…" : paymentUi.cta}
          </button>
          <button
            type="button"
            className={styles.waBtn}
            disabled={items.length === 0 || !whatsappNumber}
            onClick={openWhatsApp}
          >
            Checkout via WhatsApp
          </button>
        </div>
        {!paymentUi.configured && (
          <p className={styles.hint}>
            Configure {paymentUi.label} keys to enable card payments.
          </p>
        )}
        {!whatsappNumber && (
          <p className={styles.hint}>
            Set NEXT_PUBLIC_WHATSAPP_NUMBER (e.g. 2348012345678) for WhatsApp checkout.
          </p>
        )}
      </div>
      <aside className={styles.summary}>
        <h3>Order summary</h3>
        {items.map((i) => (
          <div key={`${i.productId}:${i.color ?? ""}`} className={styles.line}>
            <span>
              {i.name}
              {i.color ? ` · ${i.color}` : ""} × {i.quantity}
            </span>
            <span>{formatCedis(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className={styles.total}>
          <span>Total</span>
          <strong>
            {formatCedis(subtotal)}
          </strong>
        </div>
      </aside>
    </div>
  );
}
