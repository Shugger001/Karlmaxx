import { SignupForm } from "@/components/SignupForm";
import Link from "next/link";
import styles from "./auth.module.css";

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.lead}>Join Karlmaxx for a tailored experience.</p>
        <SignupForm />
        <p className={styles.footer}>
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
