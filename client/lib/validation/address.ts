import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
