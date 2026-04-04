"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ShopSearchProvider } from "@/context/ShopSearchContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ShopSearchProvider>{children}</ShopSearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}
