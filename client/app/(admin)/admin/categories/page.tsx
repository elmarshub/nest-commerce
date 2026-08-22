import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { Pagination } from "@/components/category/pagination";
import { Button } from "@/components/ui/button";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminCategories } from "@/lib/api/admin/categories";

const PAGE_SIZE = 20;

interface CategoriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  const query = await searchParams;
  const page = Number(query.page) || 1;

  const { headers } = await requireAuthHeaders();
  const categories = headers
    ? await getAdminCategories({ page, limit: PAGE_SIZE }, headers)
    : null;

  return (
    <div>
      <AdminHeader
        title="Categories"
        actions={
          <Button asChild className="rounded-none">
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        }
      />
      <div className="px-6 py-8">
        <CategoriesTable categories={categories?.data ?? []} />
        {categories && (
          <Pagination currentPage={page} totalPages={categories.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
