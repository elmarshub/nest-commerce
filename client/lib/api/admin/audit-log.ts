import "server-only";
import { api } from "@/lib/api/client";
import type { paths } from "@/lib/api/schema";

type AuditLogQuery = NonNullable<
  paths["/api/v1/audit-logs"]["get"]["parameters"]["query"]
>;

export async function getAuditLogs(
  query: AuditLogQuery | undefined,
  headers: { Authorization: string },
) {
  const { data, error } = await api.GET("/api/v1/audit-logs", {
    params: { query },
    headers,
  });

  if (error) return null;

  return data;
}
