import { OrdersView } from "@/components/admin/views/OrdersView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return <OrdersView />;
}
