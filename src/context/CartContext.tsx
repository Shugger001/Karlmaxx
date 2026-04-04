"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "karlmaxx_cart";

function sameLine(a: Pick<CartItem, "productId" | "color">, b: Pick<CartItem, "productId" | "color">) {
  return a.productId === b.productId && (a.color ?? "") === (b.color ?? "");
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, color?: string) => void;
  setQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function isCartItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.quantity === "number" &&
    typeof o.image === "string"
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount (browser-only).
    queueMicrotask(() => {
      setItems(loadInitial());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const qty = item.quantity ?? 1;
      const color = item.color;
      setItems((prev) => {
        const idx = prev.findIndex((i) => sameLine(i, { productId: item.productId, color }));
        if (idx >= 0) {
          const next = [...prev];
          const row = next[idx]!;
          next[idx] = {
            ...row,
            quantity: row.quantity + qty,
          };
          return next;
        }
        return [
          ...prev,
          {
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: qty,
            ...(color ? { color } : {}),
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, { productId, color })));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number, color?: string) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => !sameLine(i, { productId, color })));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        sameLine(i, { productId, color }) ? { ...i, quantity } : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () =>
      Math.round(
        items.reduce((s, i) => s + i.price * i.quantity, 0) * 100,
      ) / 100,
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((n, i) => n + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      subtotal,
      itemCount,
    }),
    [
      items,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      subtotal,
      itemCount,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
