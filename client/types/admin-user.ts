import type { paths } from "@/lib/api/schema";

export type AdminUser =
  paths["/api/v1/users/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
