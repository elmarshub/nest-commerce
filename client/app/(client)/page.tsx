import { Suspense } from "react";
import { getProducts } from "@/lib/api/products";
import { FiftyFiftySection } from "@/components/content/fifty-fifty-section";
import { ProductCarousel } from "@/components/content/product-carousel";
import { ProductCarouselSkeleton } from "@/components/content/product-carousel-skeleton";
import { LargeHero } from "@/components/content/large-hero";
import { OneThirdTwoThirdsSection } from "@/components/content/one-third-two-thirds-section";
import { EditorialSection } from "@/components/content/editorial-section";

async function FeaturedProducts() {
  const featured = await getProducts({ limit: 8 });
  return <ProductCarousel products={featured.data} />;
}

export default function Home() {
  return (
    <div className="pt-6">
      <FiftyFiftySection />
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <LargeHero />
      <OneThirdTwoThirdsSection />
      <EditorialSection />
    </div>
  );
}
