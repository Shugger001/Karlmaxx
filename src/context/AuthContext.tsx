"use client";

import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "@/types";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  /** Re-fetch profile from Supabase (e.g. after role change in dashboard). */
  refreshProfile: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signInGoogle: (afterAuthPath?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(
  userId: string,
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, display_name, role, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] profiles select failed:", error.message, error.code);
    return null;
  }
  if (!data) {
    console.warn("[auth] no profiles row for user id — add a row or check trigger handle_new_user");
    return null;
  }
  const rawRole = String(data.role ?? "")
    .trim()
    .toLowerCase();
  const role: UserRole = rawRole === "admin" ? "admin" : "user";
  return {
    email: data.email,
    displayName: data.display_name,
    role,
    createdAt: data.created_at,
  };
}

/** Safety cap only; timer is cleared when the query finishes (avoids false timeout logs after success). */
const PROFILE_FETCH_MS = 25_000;

function loadProfileWithTimeout(
  userId: string,
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
): Promise<UserProfile | null> {
  return new Promise((resolve) => {
    let settled = false;
    const t = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      console.error(
        `[auth] profiles query timed out after ${PROFILE_FETCH_MS / 1000}s (check network / Supabase)`,
      );
      resolve(null);
    }, PROFILE_FETCH_MS);

    void loadProfile(userId, supabase)
      .then((p) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(t);
        resolve(p);
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(t);
        console.error("[auth] profile load threw:", err);
        resolve(null);
      });
  });
}

/** Insert missing profiles row (RLS policy profiles_insert_own). Cannot set admin from client. */
async function bootstrapProfileIfMissing(
  u: User,
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
): Promise<boolean> {
  const meta = u.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    (typeof meta?.display_name === "string" && meta.display_name) ||
    (typeof meta?.full_name === "string" && meta.full_name) ||
    "";
  const { error } = await supabase.from("profiles").insert({
    id: u.id,
    email: u.email ?? null,
    display_name: displayName,
    role: "user",
  });
  if (!error) return true;
  if (error.code === "23505") return true;
  console.error("[auth] profiles bootstrap insert failed:", error.message, error.code);
  return false;
}

async function loadProfileOrBootstrap(
  u: User,
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
): Promise<UserProfile | null> {
  let p = await loadProfileWithTimeout(u.id, supabase);
  if (p) return p;
  const attempted = await bootstrapProfileIfMissing(u, supabase);
  if (!attempted) return null;
  return loadProfileWithTimeout(u.id, supabase);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;
    /** Only the latest profile fetch may commit (avoids races after subscribe). */
    let applySeq = 0;
    /** User id we already loaded profile for; used to skip refetch on TOKEN_REFRESHED. */
    let profileLoadedForUserId: string | null = null;
    /** After first getSession + apply, ignore duplicate INITIAL_SESSION from onAuthStateChange. */
    let initialHydrationDone = false;

    const applySession = async (session: Session | null, event?: AuthChangeEvent) => {
      const seq = ++applySeq;
      const u = session?.user ?? null;
      if (cancelled) return;
      setUser(u);
      if (!u) {
        profileLoadedForUserId = null;
        setProfile(null);
        setLoading(false);
        return;
      }

      if (
        event === "TOKEN_REFRESHED" &&
        profileLoadedForUserId === u.id
      ) {
        if (cancelled || seq !== applySeq) return;
        setLoading(false);
        return;
      }

      if (
        event === "INITIAL_SESSION" &&
        initialHydrationDone &&
        profileLoadedForUserId === u.id
      ) {
        if (cancelled || seq !== applySeq) return;
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const p = await loadProfileOrBootstrap(u, supabase);
        if (cancelled || seq !== applySeq) return;
        setProfile(p);
        profileLoadedForUserId = p ? u.id : null;
      } catch (err) {
        console.error("[auth] profile load failed:", err);
        if (!cancelled && seq === applySeq) {
          setProfile(null);
          profileLoadedForUserId = null;
        }
      } finally {
        if (!cancelled && seq === applySeq) setLoading(false);
      }
    };

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      await applySession(session, "INITIAL_SESSION");
      initialHydrationDone = true;
      if (cancelled) return;
      const { data } = supabase.auth.onAuthStateChange((event, sess) => {
        void applySession(sess, event);
      });
      subscription = data.subscription;
    })();

    const safetyMs = 20_000;
    const safety = window.setTimeout(() => {
      if (cancelled) return;
      setLoading((still) => {
        if (still) {
          console.error(
            `[auth] auth still loading after ${safetyMs / 1000}s — clearing spinner (check Supabase URL, keys, and network)`,
          );
        }
        return false;
      });
    }, safetyMs);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = useMemo(
    () => async () => {
      if (!isSupabaseConfigured()) return;
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const u = session?.user;
      if (!u) return;
      setLoading(true);
      try {
        const p = await loadProfileOrBootstrap(u, supabase);
        setProfile(p);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      refreshProfile,
      signInEmail: async (email, password) => {
        if (!isSupabaseConfigured()) {
          throw new Error(SUPABASE_CLIENT_SETUP_MESSAGE);
        }
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUpEmail: async (email, password, displayName) => {
        if (!isSupabaseConfigured()) {
          throw new Error(SUPABASE_CLIENT_SETUP_MESSAGE);
        }
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        const needsEmailConfirmation = Boolean(data.user && !data.session);
        return { needsEmailConfirmation };
      },
      signInGoogle: async (afterAuthPath) => {
        if (!isSupabaseConfigured()) {
          throw new Error(SUPABASE_CLIENT_SETUP_MESSAGE);
        }
        const supabase = createSupabaseBrowserClient();
        const next =
          afterAuthPath &&
          afterAuthPath.startsWith("/") &&
          !afterAuthPath.startsWith("//") &&
          !afterAuthPath.includes("..")
            ? afterAuthPath
            : "/";
        const callback = new URL("/auth/callback", window.location.origin);
        callback.searchParams.set("next", next);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callback.toString(),
          },
        });
        if (error) throw error;
      },
      logout: async () => {
        if (!isSupabaseConfigured()) return;
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      },
    }),
    [user, profile, loading, refreshProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
