import { AdminHeader } from "@/components/admin/admin-header";
import { OrdersToolbar } from "@/components/admin/orders/orders-toolbar";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { Pagination } from "@/components/category/pagination";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminOrders } from "@/lib/api/admin/orders";
import { getEnums } from "@/lib/api/meta";
import type { paths } from "@/lib/api/schema";

type OrderStatus = NonNullable<
  paths["/api/v1/orders/admin/all"]["get"]["parameters"]["query"]
>["status"];

const PAGE_SIZE = 20;

interface OrdersPageProps {
  searchParams: Promise<{ page?: string; status?: string; userId?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const query = await searchParams;
  const page = Number(query.page) || 1;

  const { headers } = await requireAuthHeaders();
  const [orders, enums] = await Promise.all([
    headers
      ? getAdminOrders(
          {
            page,
            limit: PAGE_SIZE,
            status: query.status as OrderStatus,
            userId: query.userId || undefined,
          },
          headers,
        )
      : null,
    getEnums(),
  ]);

  return (
    <div>
      <AdminHeader title="Orders" />
      <div className="px-6 py-8">
        <OrdersToolbar statusOptions={enums?.OrderStatus ?? []} />
        <OrdersTable orders={orders?.data ?? []} />
        {orders && (
          <Pagination currentPage={page} totalPages={orders.meta.totalPages} />
        )}
      </div>
    </div>
  );
}
