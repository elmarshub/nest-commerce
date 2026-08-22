import "server-only";
import { api } from "@/lib/api/client";
import type { paths } from "@/lib/api/schema";

type AdminOrdersQuery = NonNullable<
  paths["/api/v1/orders/admin/all"]["get"]["parameters"]["query"]
>;

export async function getAdminOrders(
  query: AdminOrdersQuery | undefined,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/orders/admin/all", {
    params: { query },
    headers,
  });

  if (error) return null;

  return data;
}

export async function getAdminOrder(
  id: string,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/orders/admin/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) return null;

  return data;
}
