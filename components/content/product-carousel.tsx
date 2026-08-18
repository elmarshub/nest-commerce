import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product";

interface ProductCarouselProps {
  title?: string;
  products: Product[];
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="w-full mb-16 px-6">
      {title && <h2 className="text-sm font-light text-foreground mb-4">{title}</h2>}
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
