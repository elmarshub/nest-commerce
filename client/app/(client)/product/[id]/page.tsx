import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductDescription } from "@/components/product/product-description";
import { ProductCarousel } from "@/components/content/product-carousel";
import { ProductCarouselSkeleton } from "@/components/content/product-carousel-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};

  const description = product.description ?? `Shop ${product.name} at Haven.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

function excludeCurrent<T extends { id: string }>(items: T[], currentId: string) {
  return items.filter((item) => item.id !== currentId);
}

async function RelatedProducts({ excludeId }: { excludeId: string }) {
  const related = await getProducts({ limit: 8 });
  return <ProductCarousel products={excludeCurrent(related.data, excludeId)} />;
}

async function SameCategoryProducts({
  categoryId,
  excludeId,
}: {
  categoryId: string;
  excludeId: string;
}) {
  const sameCategory = await getProducts({ categoryId, limit: 8 });
  return <ProductCarousel products={excludeCurrent(sameCategory.data, excludeId)} />;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const reviews = await getProductReviews(id);

  const productImages = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="pt-6">
      <section className="w-full px-6">
        <div className="lg:hidden mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/category/${product.category.slug}`}>
                    {product.category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <ProductImageGallery images={productImages} productName={product.name} />

          <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
            <ProductInfo product={product} />
            <ProductDescription
              product={product}
              reviews={reviews?.data ?? []}
              reviewsError={reviews === null}
            />
          </div>
        </div>
      </section>

      <section className="w-full mt-16 lg:mt-24">
        <div className="mb-4 px-6">
          <h2 className="text-sm font-light text-foreground">You might also like</h2>
        </div>
        <Suspense fallback={<ProductCarouselSkeleton />}>
          <RelatedProducts excludeId={product.id} />
        </Suspense>
      </section>

      <section className="w-full">
        <div className="mb-4 px-6">
          <h2 className="text-sm font-light text-foreground">
            Our other {product.category.name}
          </h2>
        </div>
        <Suspense fallback={<ProductCarouselSkeleton />}>
          <SameCategoryProducts categoryId={product.categoryId} excludeId={product.id} />
        </Suspense>
      </section>
    </div>
  );
}
