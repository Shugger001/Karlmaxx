import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, SUPABASE_CLIENT_SETUP_MESSAGE } from "./env";

export { isSupabaseConfigured, SUPABASE_CLIENT_SETUP_MESSAGE } from "./env";

export function createSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("Supabase browser client is only available in the browser.");
  }
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(SUPABASE_CLIENT_SETUP_MESSAGE);
  }
  return createBrowserClient(env.url, env.anonKey);
}
