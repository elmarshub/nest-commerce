import type { paths } from "@/lib/api/schema";

export type Payment =
  paths["/api/v1/payments/{id}/sync"]["post"]["responses"]["200"]["content"]["application/json"];
