import { ProductsView } from "@/components/admin/views/ProductsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return <ProductsView />;
}
