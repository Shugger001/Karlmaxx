import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";
import { Suspense } from "react";
import styles from "../signup/auth.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lead}>Welcome back to Karlmaxx.</p>
        <Suspense fallback={<p className={styles.lead}>Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className={styles.footer}>
          No account? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
