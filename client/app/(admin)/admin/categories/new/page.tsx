import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryForm } from "@/components/admin/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminHeader title="Add Category" />
      <div className="px-6 py-8 max-w-3xl">
        <CategoryForm />
      </div>
    </div>
  );
}
