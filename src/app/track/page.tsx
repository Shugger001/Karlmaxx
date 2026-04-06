import { TrackOrderView } from "@/components/TrackOrderView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Track order",
  description:
    "Track your Karlmaxx order status with your reference and email or a tracking token.",
};

function TrackFallback() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "3rem 1.5rem",
        color: "var(--muted)",
      }}
    >
      Loading…
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackFallback />}>
      <TrackOrderView />
    </Suspense>
  );
}
