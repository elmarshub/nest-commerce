import "server-only";
import { api } from "@/lib/api/client";
import type { paths } from "@/lib/api/schema";

type AdminCategoriesQuery = NonNullable<
  paths["/api/v1/categories"]["get"]["parameters"]["query"]
>;

export async function getAdminCategories(
  query: AdminCategoriesQuery | undefined,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/categories", {
    params: { query },
    headers,
  });

  if (error) return null;

  return data;
}

export async function getAdminCategory(
  id: string,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/categories/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) return null;

  return data;
}
