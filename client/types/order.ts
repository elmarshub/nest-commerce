import type { paths } from "@/lib/api/schema";

export type Order =
  paths["/api/v1/orders"]["post"]["responses"]["201"]["content"]["application/json"];
