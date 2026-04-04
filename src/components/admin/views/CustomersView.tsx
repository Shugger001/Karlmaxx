"use client";

import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { useState } from "react";
import s from "../adminShared.module.css";

export function CustomersView() {
  const { profiles, loading, refresh, supabaseReady } = useAdminData();
  const { user } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const changeRole = async (id: string, role: UserRole) => {
    if (!supabaseReady) return;
    const target = profiles.find((p) => p.id === id);
    if (!target || target.role === role) return;
    if (id === user?.id && role === "user") {
      if (
        !window.confirm(
          "Remove admin role from your own account? You will lose access to this dashboard.",
        )
      ) {
        return;
      }
    }
    setBusyId(id);
    setMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
      setMsg({ ok: true, text: "Profile updated." });
      await refresh();
      if (id === user?.id && role === "user") {
        window.location.href = "/";
      }
    } catch {
      setMsg({
        ok: false,
        text: "Could not update role. Run migration 006_admin_dashboard_rls.sql on your database.",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className={s.msg}>Loading customers…</p>;
  }

  return (
    <div className={s.panel}>
      <h2 className={s.panelTitle}>Customers &amp; staff</h2>
      <p className={s.msg} style={{ color: "var(--muted)", marginTop: 0 }}>
        Promote trusted accounts to <strong>admin</strong> so they can use this
        console. Customer data lives in <code className={s.mono}>profiles</code>{" "}
        (linked to Supabase Auth).
      </p>
      {msg && (
        <p className={msg.ok ? s.msgOk : s.msgError}>{msg.text}</p>
      )}
      {profiles.length === 0 ? (
        <p className={s.msg}>No profiles yet.</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Display name</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.email ?? "—"}</td>
                  <td>{p.displayName?.trim() ? p.displayName : "—"}</td>
                  <td>
                    <select
                      className={s.select}
                      style={{ padding: "0.4rem", fontSize: "0.8rem" }}
                      value={p.role}
                      disabled={!supabaseReady || busyId === p.id}
                      onChange={(e) =>
                        void changeRole(p.id, e.target.value as UserRole)
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className={s.mono} style={{ fontSize: "0.72rem" }}>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
