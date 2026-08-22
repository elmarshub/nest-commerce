import "server-only";
import { api } from "@/lib/api/client";
import type { paths } from "@/lib/api/schema";

type AdminProductsQuery = NonNullable<
  paths["/api/v1/products"]["get"]["parameters"]["query"]
>;

export async function getAdminProducts(
  query: AdminProductsQuery | undefined,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/products", {
    params: { query },
    headers,
  });

  if (error) return null;

  return data;
}

export async function getAdminProduct(
  id: string,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/products/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) return null;

  return data;
}
