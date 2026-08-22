import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { CancelOrderButton } from "@/components/admin/orders/cancel-order-button";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { getAdminOrder } from "@/lib/api/admin/orders";
import { getEnums } from "@/lib/api/meta";
import { formatPrice, formatDate } from "@/lib/format";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const { headers } = await requireAuthHeaders();
  if (!headers) notFound();

  const [order, enums] = await Promise.all([
    getAdminOrder(id, headers),
    getEnums(),
  ]);

  if (!order) notFound();

  return (
    <div>
      <AdminHeader
        title={`Order #${order.orderNumber}`}
        actions={<CancelOrderButton orderId={order.id} />}
      />
      <div className="px-6 py-8 space-y-6 max-w-4xl">
        <div className="bg-muted/20 p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-foreground">Order Details</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="text-foreground">
                {order.userName} ({order.userEmail})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Placed</p>
              <p className="text-foreground">{formatDate(order.createdAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground">Shipping Address</p>
              <p className="text-foreground">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/20 p-8 space-y-4">
          <h2 className="text-lg font-light text-foreground">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.productName} × {item.quantity}
                </span>
                <span className="text-muted-foreground">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-border text-sm font-medium">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        <OrderStatusForm order={order} statusOptions={enums?.OrderStatus ?? []} />
      </div>
    </div>
  );
}
