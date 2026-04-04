"use client";

import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "@/types";
import type { Session, User } from "@supabase/supabase-js";
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
  if (error || !data) return null;
  const role: UserRole = data.role === "admin" ? "admin" : "user";
  return {
    email: data.email,
    displayName: data.display_name,
    role,
    createdAt: data.created_at,
  };
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

    const applySession = async (session: Session | null) => {
      const u = session?.user ?? null;
      if (cancelled) return;
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const p = await loadProfile(u.id, supabase);
        if (cancelled) return;
        setProfile(p);
      } catch (err) {
        console.error("[auth] profile load failed:", err);
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

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
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
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
    [user, profile, loading],
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
