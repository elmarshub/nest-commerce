import "server-only";
import { api } from "./client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";

export async function getOrder(id: string) {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.GET("/api/v1/orders/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) return null;

  return data;
}

export async function getMyOrders() {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.GET("/api/v1/orders", {
    params: { query: { limit: 50 } },
    headers,
  });

  if (error || !data) return null;

  return data;
}
