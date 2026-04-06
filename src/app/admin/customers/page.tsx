import { CustomersView } from "@/components/admin/views/CustomersView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};

export default function AdminCustomersPage() {
  return <CustomersView />;
}
