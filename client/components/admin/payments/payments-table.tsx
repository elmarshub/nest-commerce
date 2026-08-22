import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefundButton } from "@/components/admin/payments/refund-button";
import { formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";

const currencyFormat = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No payments found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="text-muted-foreground">{payment.orderId}</TableCell>
            <TableCell>{currencyFormat(payment.amount, payment.currency)}</TableCell>
            <TableCell>
              <Badge
                variant={payment.status === "COMPLETED" ? "default" : "secondary"}
                className="rounded-none capitalize"
              >
                {payment.status.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {payment.paymentMethod ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {payment.transactionId ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(payment.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              {payment.status === "COMPLETED" && (
                <RefundButton paymentId={payment.id} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
