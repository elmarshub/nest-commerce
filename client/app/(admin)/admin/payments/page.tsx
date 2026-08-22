import { AdminHeader } from "@/components/admin/admin-header";
import { PaymentsToolbar } from "@/components/admin/payments/payments-toolbar";
import { PaymentsTable } from "@/components/admin/payments/payments-table";
import { Pagination } from "@/components/category/pagination";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminPayments } from "@/lib/api/admin/payments";
import { getEnums } from "@/lib/api/meta";
import type { paths } from "@/lib/api/schema";

type PaymentStatus = NonNullable<
  paths["/api/v1/payments"]["get"]["parameters"]["query"]
>["status"];

const PAGE_SIZE = 20;

interface PaymentsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  const query = await searchParams;
  const page = Number(query.page) || 1;

  const { headers } = await requireAuthHeaders();
  const [payments, enums] = await Promise.all([
    headers
      ? getAdminPayments(
          { page, limit: PAGE_SIZE, status: query.status as PaymentStatus },
          headers,
        )
      : null,
    getEnums(),
  ]);

  return (
    <div>
      <AdminHeader title="Payments" />
      <div className="px-6 py-8">
        <PaymentsToolbar statusOptions={enums?.PaymentStatus ?? []} />
        <PaymentsTable payments={payments?.data ?? []} />
        {payments && (
          <Pagination currentPage={page} totalPages={payments.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
