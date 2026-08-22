import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";

export function ProductCarouselSkeleton({ withTitle = false }: { withTitle?: boolean }) {
  return (
    <section className="w-full mb-16 px-6">
      {withTitle && <div className="h-4 w-32 mb-4 animate-pulse rounded-md bg-muted" />}
      <div className="flex gap-2 md:gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/4 shrink-0">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
