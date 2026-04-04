"use client";

import { useAuth } from "@/context/AuthContext";
import {
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./LoginForm.module.css";

function authErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "Could not create account. Try a different email.";
}

export function SignupForm() {
  const { signUpEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmSent, setEmailConfirmSent] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <p className={styles.configWarn} role="alert">
        {SUPABASE_CLIENT_SETUP_MESSAGE}
      </p>
    );
  }

  if (emailConfirmSent) {
    return (
      <div className={styles.successPanel}>
        <p className={styles.successTitle}>Check your email</p>
        <p className={styles.successBody}>
          We sent a confirmation link to <strong>{email}</strong>. Open it to
          finish setting up your account, then return here to sign in.
        </p>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const { needsEmailConfirmation } = await signUpEmail(
        email.trim(),
        password,
        displayName.trim(),
      );
      if (needsEmailConfirmation) {
        setEmailConfirmSent(true);
      } else {
        router.push("/");
        router.refresh();
      }
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
      await signInGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => void submit(e)}>
      <label className={styles.label}>
        <span>Display name</span>
        <input
          className={styles.input}
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </label>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.btn} disabled={busy}>
        Create account
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
