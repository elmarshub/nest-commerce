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
  categorySchema,
  type CategoryFormValues,
} from "@/lib/validation/admin/category";
import { createCategory, updateCategory } from "@/lib/admin/categories/actions";
import { uploadCategoryImage } from "@/lib/admin/uploads/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Category } from "@/types/category";

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      slug: category?.slug ?? "",
      imageUrl: category?.imageUrl ?? "",
      isActive: category?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setSubmitting(true);
    const result = category
      ? await updateCategory(category.id, data)
      : await createCategory(data);
    setSubmitting(false);

    if (!result.category) {
      toast.error("Something went wrong", { description: result.error ?? undefined });
      return;
    }

    toast.success(category ? "Category updated" : "Category created");
    router.push("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-muted/20 p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-sm font-light">
            Name
          </Label>
          <Input id="name" {...register("name")} className="mt-2 rounded-none" />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug" className="text-sm font-light">
            Slug
          </Label>
          <Input
            id="slug"
            {...register("slug")}
            className="mt-2 rounded-none"
            placeholder="auto-generated if left blank"
          />
          {errors.slug && (
            <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
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
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImageUploader
                label="Category Image"
                value={field.value}
                onChange={field.onChange}
                upload={uploadCategoryImage}
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
          onClick={() => router.push("/admin/categories")}
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
          ) : category ? (
            "Save Changes"
          ) : (
            "Create Category"
          )}
        </Button>
      </div>
    </form>
  );
}
