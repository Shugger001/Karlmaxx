import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminDataProvider } from "@/context/AdminDataContext";

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDataProvider>
        <AdminShell />
      </AdminDataProvider>
    </AdminGate>
  );
}
