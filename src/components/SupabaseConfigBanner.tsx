import { SUPABASE_CLIENT_SETUP_MESSAGE, isSupabaseConfigured } from "@/lib/supabase/env";
import styles from "./SupabaseConfigBanner.module.css";

/** Server Component: reads `.env.local` at request time (avoids stale client bundle env). */
export function SupabaseConfigBanner() {
  if (process.env.NODE_ENV !== "development") return null;
  if (isSupabaseConfigured()) return null;

  return (
    <div className={styles.banner} role="status">
      {SUPABASE_CLIENT_SETUP_MESSAGE} See <code>.env.example</code> and{" "}
      <code>supabase/migrations/001_initial.sql</code>.
    </div>
  );
}
