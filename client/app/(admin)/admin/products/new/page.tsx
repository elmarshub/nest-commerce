import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getCategories } from "@/lib/api/categories";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <AdminHeader title="Add Product" />
      <div className="px-6 py-8 max-w-3xl">
        <ProductForm categories={categories?.data ?? []} />
      </div>
    </div>
  );
}
