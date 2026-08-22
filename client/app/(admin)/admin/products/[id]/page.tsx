import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { StockAdjustPanel } from "@/components/admin/products/stock-adjust-panel";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminProduct } from "@/lib/api/admin/products";
import { getCategories } from "@/lib/api/categories";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const { headers } = await requireAuthHeaders();
  if (!headers) notFound();

  const [product, categories] = await Promise.all([
    getAdminProduct(id, headers),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminHeader title={`Edit ${product.name}`} />
      <div className="px-6 py-8 max-w-3xl space-y-6">
        <ProductForm product={product} categories={categories?.data ?? []} />
        <StockAdjustPanel productId={product.id} currentStock={product.stock} />
      </div>
    </div>
  );
}
