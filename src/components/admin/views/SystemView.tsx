"use client";

import { useAdminData } from "@/context/AdminDataContext";
import {
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import Link from "next/link";
import s from "../adminShared.module.css";

export function SystemView() {
  const { supabaseReady, error, refresh, loading } = useAdminData();

  return (
    <div className={s.panel}>
      <h2 className={s.panelTitle}>System &amp; integrations</h2>
      <ul
        style={{
          margin: 0,
          paddingLeft: "1.1rem",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          color: "var(--foreground)",
        }}
      >
        <li>
          <strong>Storefront:</strong>{" "}
          <Link href="/" style={{ color: "var(--accent)" }}>
            Open live site
          </Link>
        </li>
        <li>
          <strong>Supabase:</strong>{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            Open dashboard
          </a>
          {process.env.NEXT_PUBLIC_SUPABASE_URL
            ? " (project URL is set in env)"
            : " — set NEXT_PUBLIC_SUPABASE_URL in .env.local"}
          .
        </li>
        <li>
          <strong>Database:</strong> run migrations in{" "}
          <code className={s.mono}>supabase/migrations/</code>, including{" "}
          <code className={s.mono}>006_admin_dashboard_rls.sql</code> for
          customer list and order status edits from this UI.
        </li>
        <li>
          <strong>Payments:</strong> Paystack keys in{" "}
          <code className={s.mono}>.env.local</code> — see README.
        </li>
        <li>
          <strong>Product images:</strong> Storage bucket{" "}
          <code className={s.mono}>product-images</code> (public read, admin
          write).
        </li>
      </ul>
      <div style={{ marginTop: "1.25rem" }}>
        <p className={s.msg} style={{ marginTop: 0 }}>
          <strong>Connection</strong>
        </p>
        {!isSupabaseConfigured() ? (
          <p className={s.msgError}>{SUPABASE_CLIENT_SETUP_MESSAGE}</p>
        ) : (
          <p className={s.msgOk}>
            Browser Supabase client is configured
            {supabaseReady ? "" : " (unexpected)"}.
          </p>
        )}
        {error && <p className={s.msgError}>{error}</p>}
        <button
          type="button"
          className={s.btn}
          style={{ marginTop: "0.75rem" }}
          disabled={loading}
          onClick={() => void refresh()}
        >
          Refresh all data
        </button>
      </div>
    </div>
  );
}
