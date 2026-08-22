import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>;
