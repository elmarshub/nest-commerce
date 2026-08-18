import type { paths } from "@/lib/api/schema";

export type Review =
  paths["/api/v1/products/{productId}/reviews"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];
