import { HomeExplore } from "@/components/HomeExplore";
import { HomeHero } from "@/components/HomeHero";
import { HomeTrustBar } from "@/components/HomeTrustBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Suspense } from "react";

function CatalogSuspenseFallback() {
  return (
    <section
      style={{
        minHeight: "280px",
        padding: "clamp(2.5rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)",
        maxWidth: 1200,
        margin: "0 auto",
      }}
      aria-busy="true"
      aria-label="Loading catalog"
    />
  );
}

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeTrustBar />
      <HomeExplore />
      <Suspense fallback={<CatalogSuspenseFallback />}>
        <ProductGrid />
      </Suspense>
    </>
  );
}
