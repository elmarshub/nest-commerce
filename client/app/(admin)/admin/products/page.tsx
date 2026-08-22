import { AdminHeader } from "@/components/admin/admin-header";
import { ProductsToolbar } from "@/components/admin/products/products-toolbar";
import { ProductsTable } from "@/components/admin/products/products-table";
import { Pagination } from "@/components/category/pagination";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminProducts } from "@/lib/api/admin/products";
import { getCategories } from "@/lib/api/categories";

const PAGE_SIZE = 20;

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  const page = Number(query.page) || 1;

  const { headers } = await requireAuthHeaders();
  const [products, categories] = await Promise.all([
    headers
      ? getAdminProducts(
          {
            page,
            limit: PAGE_SIZE,
            search: query.search || undefined,
            categoryId: query.categoryId || undefined,
          },
          headers,
        )
      : null,
    getCategories(),
  ]);

  return (
    <div>
      <AdminHeader title="Products" />
      <div className="px-6 py-8">
        <ProductsToolbar categories={categories?.data ?? []} />
        <ProductsTable products={products?.data ?? []} />
        {products && (
          <Pagination currentPage={page} totalPages={products.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
