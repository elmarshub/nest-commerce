import { AdminHeader } from "@/components/admin/admin-header";
import { AuditLogToolbar } from "@/components/admin/audit-log/audit-log-toolbar";
import { AuditLogTable } from "@/components/admin/audit-log/audit-log-table";
import { Pagination } from "@/components/category/pagination";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAuditLogs } from "@/lib/api/admin/audit-log";
import type { paths } from "@/lib/api/schema";

type AuditAction = NonNullable<
  paths["/api/v1/audit-logs"]["get"]["parameters"]["query"]
>["action"];

const PAGE_SIZE = 20;

interface AuditLogPageProps {
  searchParams: Promise<{ page?: string; action?: string; actorId?: string }>;
}

export default async function AdminAuditLogPage({ searchParams }: AuditLogPageProps) {
  const query = await searchParams;
  const page = Number(query.page) || 1;

  const { headers } = await requireAuthHeaders();
  const logs = headers
    ? await getAuditLogs(
        {
          page,
          limit: PAGE_SIZE,
          action: query.action as AuditAction,
          actorId: query.actorId || undefined,
        },
        headers,
      )
    : null;

  return (
    <div>
      <AdminHeader title="Audit Log" />
      <div className="px-6 py-8">
        <AuditLogToolbar />
        <AuditLogTable entries={logs?.data ?? []} />
        {logs && (
          <Pagination currentPage={page} totalPages={logs.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
