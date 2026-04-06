import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin-exclusive.css";

const adminUi = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-ui",
});

const adminDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-admin-display",
});

export const metadata: Metadata = {
  title: "Private suite",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`adminExclusiveScope ${adminUi.variable} ${adminDisplay.variable}`}>
      <AdminGate>
        <AdminDataProvider>
          <AdminShell>{children}</AdminShell>
        </AdminDataProvider>
      </AdminGate>
    </div>
  );
}
