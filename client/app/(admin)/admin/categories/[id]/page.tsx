import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminCategory } from "@/lib/api/admin/categories";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const { headers } = await requireAuthHeaders();
  if (!headers) notFound();

  const category = await getAdminCategory(id, headers);
  if (!category) notFound();

  return (
    <div>
      <AdminHeader title={`Edit ${category.name}`} />
      <div className="px-6 py-8 max-w-3xl">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
