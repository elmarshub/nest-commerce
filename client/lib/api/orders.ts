import "server-only";
import { api } from "./client";
import { getAccessToken } from "@/lib/auth/tokens";

export async function getOrder(id: string) {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const { data, error } = await api.GET("/api/v1/orders/{id}", {
    params: { path: { id } },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) return null;

  return data;
}

export async function getMyOrders() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }

  const { data, error } = await api.GET("/api/v1/orders", {
    params: { query: { limit: 50 } },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error || !data) {
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }

  return data;
}
