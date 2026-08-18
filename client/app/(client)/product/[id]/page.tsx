import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductDescription } from "@/components/product/product-description";
import { ProductCarousel } from "@/components/content/product-carousel";
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [reviews, related, sameCategory] = await Promise.all([
    getProductReviews(id),
    getProducts({ limit: 8 }),
    getProducts({ categoryId: product.categoryId, limit: 8 }),
  ]);

  const productImages = product.imageUrl ? [product.imageUrl] : [];
  const excludeCurrent = <T extends { id: string }>(items: T[]) =>
    items.filter((item) => item.id !== product.id);

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
            <ProductDescription product={product} reviews={reviews.data} />
          </div>
        </div>
      </section>

      <section className="w-full mt-16 lg:mt-24">
        <div className="mb-4 px-6">
          <h2 className="text-sm font-light text-foreground">You might also like</h2>
        </div>
        <ProductCarousel products={excludeCurrent(related.data)} />
      </section>

      <section className="w-full">
        <div className="mb-4 px-6">
          <h2 className="text-sm font-light text-foreground">
            Our other {product.category.name}
          </h2>
        </div>
        <ProductCarousel products={excludeCurrent(sameCategory.data)} />
      </section>
    </div>
  );
}
