import type { paths } from "@/lib/api/schema";

export type Category =
  paths["/api/v1/categories"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];
