import { AdminHeader } from "@/components/admin/admin-header";
import { ReviewsProductPicker } from "@/components/admin/reviews/reviews-product-picker";
import { ReviewsList } from "@/components/admin/reviews/reviews-list";
import { Pagination } from "@/components/category/pagination";
import { getProducts } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";

const PAGE_SIZE = 15;

interface ReviewsPageProps {
  searchParams: Promise<{ productId?: string; page?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  const { productId, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [products, reviews] = await Promise.all([
    getProducts({ limit: 100, sortBy: "name", sortOrder: "asc" }),
    productId ? getProductReviews(productId, { page, limit: PAGE_SIZE }) : null,
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
        {productId && reviews && (
          <Pagination currentPage={page} totalPages={reviews.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
