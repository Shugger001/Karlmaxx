"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./AdminGate.module.css";

const LOGIN_WITH_RETURN = "/login?next=/admin";

export function AdminGate({ children }: { children: ReactNode }) {
  const { loading, isAdmin, user, profile, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(LOGIN_WITH_RETURN);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className={styles.center}>
        <p className={styles.text}>Verifying access…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.center}>
        <p className={styles.text}>Redirecting to sign in…</p>
        <Link href={LOGIN_WITH_RETURN} className={styles.link}>
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    const uid = user.id;
    return (
      <div className={styles.center}>
        <h1 className={styles.title}>Admin access required</h1>
        {!profile ? (
          <p className={styles.text}>
            No <strong>profiles</strong> row for your account yet. The app will try to create
            one automatically if you have run migration{" "}
            <code className={styles.code}>009_profiles_insert_own.sql</code> in Supabase. Click{" "}
            <strong>Reload permissions</strong> after running it. Your auth user id is{" "}
            <code className={styles.code}>{uid}</code> — it must match <strong>profiles.id</strong>.
            Check the console for <code className={styles.code}>[auth]</code> if this persists.
          </p>
        ) : (
          <p className={styles.text}>
            You are signed in as <strong>{profile.email ?? user.email}</strong>, but{" "}
            <code className={styles.code}>profiles.role</code> is{" "}
            <code className={styles.code}>{profile.role}</code> (need{" "}
            <code className={styles.code}>admin</code>). In Supabase Table Editor, open the
            row where <code className={styles.code}>id</code> matches{" "}
            <code className={styles.code}>{uid}</code>, set <code className={styles.code}>role</code>{" "}
            to <code className={styles.code}>admin</code>, save, then{" "}
            <strong>sign out and sign in again</strong> (or hard refresh).
          </p>
        )}
        <p className={styles.actions}>
          <button
            type="button"
            className={styles.refreshBtn}
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              try {
                await refreshProfile();
              } finally {
                setRefreshing(false);
              }
            }}
          >
            {refreshing ? "Reloading…" : "Reload permissions"}
          </button>
        </p>
        <Link href="/" className={styles.link}>
          ← Back to store
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
