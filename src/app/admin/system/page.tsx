import { SystemView } from "@/components/admin/views/SystemView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System",
};

export default function AdminSystemPage() {
  return <SystemView />;
}
