import type { paths } from "@/lib/api/schema";

export type Product =
  paths["/api/v1/products"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];
