import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/api/categories";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <AdminHeader
        title="Add Product"
        actions={
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <div className="px-6 py-8 max-w-3xl">
        <ProductForm categories={categories?.data ?? []} />
      </div>
    </div>
  );
}
