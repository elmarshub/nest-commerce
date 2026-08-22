"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/types/order";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No orders found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            onClick={() => router.push(`/admin/orders/${order.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium text-foreground">
              #{order.orderNumber}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {order.userName} ({order.userEmail})
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell>{formatPrice(order.totalAmount)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(order.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
