"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ShopSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
};

const ShopSearchContext = createContext<ShopSearchContextValue | null>(null);

export function ShopSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return (
    <ShopSearchContext.Provider value={value}>
      {children}
    </ShopSearchContext.Provider>
  );
}

export function useShopSearch(): ShopSearchContextValue {
  const ctx = useContext(ShopSearchContext);
  if (!ctx) {
    throw new Error("useShopSearch must be used within ShopSearchProvider");
  }
  return ctx;
}
