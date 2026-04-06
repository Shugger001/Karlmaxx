import { OverviewView } from "@/components/admin/views/OverviewView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

export default function AdminOverviewPage() {
  return <OverviewView />;
}
