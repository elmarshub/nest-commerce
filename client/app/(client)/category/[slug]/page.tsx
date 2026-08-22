import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { CategoryHeader } from "@/components/category/category-header";
import { FilterSortBar } from "@/components/category/filter-sort-bar";
import { Pagination } from "@/components/category/pagination";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

const PAGE_SIZE = 24;

const SORT_MAP: Record<string, { sortBy: "name" | "price" | "createdAt"; sortOrder: "asc" | "desc" }> = {
  featured: { sortBy: "createdAt", sortOrder: "desc" },
  "price-low": { sortBy: "price", sortOrder: "asc" },
  "price-high": { sortBy: "price", sortOrder: "desc" },
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  name: { sortBy: "name", sortOrder: "asc" },
};

interface CategoryQuery {
  sort?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CategoryQuery>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Haven.`,
  };
}

async function CategoryResults({
  categoryId,
  query,
}: {
  categoryId: string;
  query: CategoryQuery;
}) {
  const page = Number(query.page) || 1;
  const { sortBy, sortOrder } = SORT_MAP[query.sort ?? "featured"] ?? SORT_MAP.featured;

  const products = await getProducts({
    categoryId,
    sortBy,
    sortOrder,
    page,
    limit: PAGE_SIZE,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
  });

  return (
    <>
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
    </>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="pt-6">
      <CategoryHeader category={category.name} />

      <Suspense
        key={`${category.id}-${query.sort}-${query.page}-${query.minPrice}-${query.maxPrice}`}
        fallback={
          <>
            <div className="w-full px-6 mb-8 border-b border-border pb-4 h-[52px]" />
            <section className="w-full px-6 mb-16">
              <ProductGridSkeleton count={PAGE_SIZE} />
            </section>
          </>
        }
      >
        <CategoryResults categoryId={category.id} query={query} />
      </Suspense>
    </div>
  );
}
