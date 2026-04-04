"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import styles from "./AdminGate.module.css";

const LOGIN_WITH_RETURN = "/login?next=/admin";

export function AdminGate({ children }: { children: ReactNode }) {
  const { loading, isAdmin, user } = useAuth();
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
    return (
      <div className={styles.center}>
        <h1 className={styles.title}>Admin access required</h1>
        <p className={styles.text}>
          You are signed in, but this account does not have the admin role. An owner
          can set <code className={styles.code}>role = admin</code> on your row in
          Supabase <strong>profiles</strong>, then refresh this page.
        </p>
        <Link href="/" className={styles.link}>
          ← Back to store
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
