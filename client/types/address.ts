import type { paths } from "@/lib/api/schema";

export type Address =
  paths["/api/v1/addresses"]["get"]["responses"]["200"]["content"]["application/json"][number];
