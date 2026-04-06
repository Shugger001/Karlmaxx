import { SUPABASE_CLIENT_SETUP_MESSAGE, isSupabaseConfigured } from "@/lib/supabase/env";
import { SupabaseConfigBannerInner } from "./SupabaseConfigBannerInner";

/** Server: reads env at request time; client inner hides on `/admin`. */
export function SupabaseConfigBanner() {
  if (process.env.NODE_ENV !== "development") return null;
  if (isSupabaseConfigured()) return null;

  return (
    <SupabaseConfigBannerInner
      message={
        <>
          {SUPABASE_CLIENT_SETUP_MESSAGE} See <code>.env.example</code> and{" "}
          <code>supabase/migrations/001_initial.sql</code>.
        </>
      }
    />
  );
}
