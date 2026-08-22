import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or more"),
  sku: z.string().min(1, "SKU is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean(),
  categoryId: z.string().min(1, "Category is required"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
