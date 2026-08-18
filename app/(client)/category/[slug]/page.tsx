import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { CategoryHeader } from "@/components/category/category-header";
import { FilterSortBar } from "@/components/category/filter-sort-bar";
import { Pagination } from "@/components/category/pagination";
import { ProductCard } from "@/components/product/product-card";

const PAGE_SIZE = 24;

const SORT_MAP: Record<string, { sortBy: "name" | "price" | "createdAt"; sortOrder: "asc" | "desc" }> = {
  featured: { sortBy: "createdAt", sortOrder: "desc" },
  "price-low": { sortBy: "price", sortOrder: "asc" },
  "price-high": { sortBy: "price", sortOrder: "desc" },
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  name: { sortBy: "name", sortOrder: "asc" },
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Number(query.page) || 1;
  const { sortBy, sortOrder } = SORT_MAP[query.sort ?? "featured"] ?? SORT_MAP.featured;

  const products = await getProducts({
    categoryId: category.id,
    sortBy,
    sortOrder,
    page,
    limit: PAGE_SIZE,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
  });

  return (
    <div className="pt-6">
      <CategoryHeader category={category.name} />
      <FilterSortBar itemCount={products.meta.total} />

      {products.data.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No products found in this category.
        </p>
      ) : (
        <section className="w-full px-6 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <Pagination currentPage={page} totalPages={products.meta.totalPages} />
    </div>
  );
}
