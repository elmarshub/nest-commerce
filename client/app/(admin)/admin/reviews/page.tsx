import { AdminHeader } from "@/components/admin/admin-header";
import { ReviewsProductPicker } from "@/components/admin/reviews/reviews-product-picker";
import { ReviewsList } from "@/components/admin/reviews/reviews-list";
import { getProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";

interface ReviewsPageProps {
  searchParams: Promise<{ productId?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  const { productId } = await searchParams;

  const [products, reviews] = await Promise.all([
    getProducts({ limit: 100, sortBy: "name", sortOrder: "asc" }),
    productId ? getProductReviews(productId) : null,
  ]);

  return (
    <div>
      <AdminHeader title="Reviews" />
      <div className="px-6 py-8 space-y-6">
        <p className="text-sm text-muted-foreground max-w-2xl">
          There&apos;s no unified moderation inbox — the API only supports
          browsing reviews per product. Pick a product below to see and
          moderate its reviews.
        </p>
        <ReviewsProductPicker products={products.data} />
        {productId && <ReviewsList reviews={reviews?.data ?? []} />}
      </div>
    </div>
  );
}
