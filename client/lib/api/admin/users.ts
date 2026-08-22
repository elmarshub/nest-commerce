import "server-only";
import { api } from "@/lib/api/client";

export async function getAdminUsers(
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number },
  headers: { Authorization: string },
) {
  const skip = (page - 1) * pageSize;

  const { data, error } = await api.GET("/api/v1/users", {
    params: { query: { skip, take: pageSize } },
    headers,
  });

  if (error || !data) return null;

  // Normalize the backend's non-standard { users, total } envelope to the
  // { data, meta } shape every other admin resource returns, so shared
  // table/pagination components stay resource-agnostic.
  return {
    data: data.users,
    meta: {
      total: data.total,
      page,
      limit: pageSize,
      totalPages: Math.ceil(data.total / pageSize),
    },
  };
}
