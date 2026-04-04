"use client";

import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import { mapOrderRow, mapProductRow, mapProfileRow } from "@/lib/supabase/maps";
import type { CustomerProfile, Order, Product } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminDataContextValue = {
  products: Product[];
  orders: Order[];
  profiles: CustomerProfile[];
  loading: boolean;
  error: string | null;
  supabaseReady: boolean;
  refresh: () => Promise<void>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CLIENT_SETUP_MESSAGE);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const [pr, ord, prof] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);
      if (pr.error) throw pr.error;
      if (ord.error) throw ord.error;
      if (prof.error) throw prof.error;
      const plist: Product[] = [];
      for (const row of pr.data ?? []) {
        const p = mapProductRow(row as Record<string, unknown>);
        if (p) plist.push(p);
      }
      const olist: Order[] = [];
      for (const row of ord.data ?? []) {
        const o = mapOrderRow(row as Record<string, unknown>);
        if (o) olist.push(o);
      }
      const ulist: CustomerProfile[] = [];
      for (const row of prof.data ?? []) {
        const u = mapProfileRow(row as Record<string, unknown>);
        if (u) ulist.push(u);
      }
      setProducts(plist);
      setOrders(olist);
      setProfiles(ulist);
    } catch {
      setError(
        "Could not load dashboard data. Confirm you are logged in as an admin and run migration 006_admin_dashboard_rls.sql if Customers or order updates fail.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      products,
      orders,
      profiles,
      loading,
      error,
      supabaseReady,
      refresh,
    }),
    [products, orders, profiles, loading, error, supabaseReady, refresh],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return ctx;
}
