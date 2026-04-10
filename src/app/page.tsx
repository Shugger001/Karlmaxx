import { HomeExplore } from "@/components/HomeExplore";
import { HomeHero } from "@/components/HomeHero";
import { HomeJoinBand } from "@/components/HomeJoinBand";
import { HomePromoStrip } from "@/components/HomePromoStrip";
import { ProductGrid } from "@/components/ProductGrid";
import gridStyles from "@/components/ProductGrid.module.css";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { Suspense } from "react";

function ProductGridFallback() {
  return (
    <section
      id="collection"
      className={gridStyles.section}
      aria-busy="true"
      aria-label="Loading catalog"
    >
      <div className={gridStyles.gridOuter}>
        <div className={gridStyles.grid}>
          {Array.from({ length: 6 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HomePromoStrip />
      <HomeHero />
      <HomeExplore />
      <Suspense fallback={<ProductGridFallback />}>
        <ProductGrid />
      </Suspense>
      <HomeJoinBand />
    </>
  );
}
