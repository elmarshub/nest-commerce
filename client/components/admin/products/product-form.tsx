"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validation/admin/product";
import { createProduct, updateProduct } from "@/lib/admin/products/actions";
import { uploadProductImage } from "@/lib/admin/uploads/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      sku: product?.sku ?? "",
      imageUrl: product?.imageUrl ?? "",
      isActive: product?.isActive ?? true,
      categoryId: product?.categoryId ?? "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true);
    const result = product
      ? await updateProduct(product.id, data)
      : await createProduct(data);
    setSubmitting(false);

    if (!result.product) {
      toast.error("Something went wrong", { description: result.error ?? undefined });
      return;
    }

    toast.success(product ? "Product updated" : "Product created");
    router.push("/admin/products");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-muted/20 p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="name" className="text-sm font-light">
            Name
          </Label>
          <Input id="name" {...register("name")} className="mt-2 rounded-none" />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description" className="text-sm font-light">
            Description
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            className="mt-2 rounded-none"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="sku" className="text-sm font-light">
            SKU
          </Label>
          <Input id="sku" {...register("sku")} className="mt-2 rounded-none" />
          {errors.sku && (
            <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="categoryId" className="text-sm font-light">
            Category
          </Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="categoryId" className="mt-2 w-full rounded-none">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price" className="text-sm font-light">
            Price
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price")}
            className="mt-2 rounded-none"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="stock" className="text-sm font-light">
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            {...register("stock")}
            className="mt-2 rounded-none"
            disabled={!!product}
          />
          {product ? (
            <p className="text-xs text-muted-foreground mt-1">
              Use the stock panel below to adjust stock on an existing product.
            </p>
          ) : (
            errors.stock && (
              <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
            )
          )}
        </div>

        <div className="md:col-span-2">
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImageUploader
                label="Product Image"
                value={field.value}
                onChange={field.onChange}
                upload={uploadProductImage}
              />
            )}
          />
          {errors.imageUrl && (
            <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>
          )}
        </div>
      </div>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            Active (visible in the store)
          </label>
        )}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          className="rounded-none"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="rounded-none">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : product ? (
            "Save Changes"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
