import { getProducts } from "@/lib/api/products";
import { FiftyFiftySection } from "@/components/content/fifty-fifty-section";
import { ProductCarousel } from "@/components/content/product-carousel";
import { LargeHero } from "@/components/content/large-hero";
import { OneThirdTwoThirdsSection } from "@/components/content/one-third-two-thirds-section";
import { EditorialSection } from "@/components/content/editorial-section";

export default async function Home() {
  const featured = await getProducts({ limit: 8 });

  return (
    <div className="pt-6">
      <FiftyFiftySection />
      <ProductCarousel products={featured.data} />
      <LargeHero />
      <OneThirdTwoThirdsSection />
      <EditorialSection />
    </div>
  );
}
