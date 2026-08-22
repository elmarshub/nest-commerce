import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(255).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
