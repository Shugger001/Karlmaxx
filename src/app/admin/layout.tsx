import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminDataProvider } from "@/context/AdminDataContext";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin-exclusive.css";

export const metadata: Metadata = {
  title: "Private suite",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="adminExclusiveScope">
      <AdminGate>
        <AdminDataProvider>
          <AdminShell>{children}</AdminShell>
        </AdminDataProvider>
      </AdminGate>
    </div>
  );
}
