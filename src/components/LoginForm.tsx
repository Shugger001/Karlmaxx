"use client";

import { useAuth } from "@/context/AuthContext";
import {
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./LoginForm.module.css";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.includes("..")) return "/";
  return raw;
}

function authErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "Something went wrong. Try again.";
}

export function LoginForm() {
  const { signInEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterLogin = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <p className={styles.configWarn} role="alert">
        {SUPABASE_CLIENT_SETUP_MESSAGE}
      </p>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInEmail(email.trim(), password);
      router.push(afterLogin);
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInGoogle(afterLogin);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => void submit(e)}>
      <label className={styles.label}>
        <span>Email</span>
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        <span>Password</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.btn} disabled={busy}>
        Sign in
      </button>
      <div className={styles.divider}>or</div>
      <button
        type="button"
        className={styles.google}
        disabled={busy}
        onClick={() => void google()}
      >
        Continue with Google
      </button>
    </form>
  );
}
