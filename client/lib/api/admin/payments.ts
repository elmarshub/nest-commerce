import "server-only";
import { api } from "@/lib/api/client";
import type { paths } from "@/lib/api/schema";

type AdminPaymentsQuery = NonNullable<
  paths["/api/v1/payments"]["get"]["parameters"]["query"]
>;

export async function getAdminPayments(
  query: AdminPaymentsQuery | undefined,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/payments", {
    params: { query },
    headers,
  });

  if (error) return null;

  return data;
}
