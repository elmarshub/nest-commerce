import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/admin/payments/payment-status-badge";
import { PaymentDetailsModal } from "@/components/admin/payments/payment-details-modal";
import { formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";

const currencyFormat = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

const shortId = (id: string) => `${id.slice(0, 8)}…`;

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
            <TableCell className="text-muted-foreground text-xs" title={payment.orderId}>
              {shortId(payment.orderId)}
            </TableCell>
            <TableCell>{currencyFormat(payment.amount, payment.currency)}</TableCell>
            <TableCell>
              <PaymentStatusBadge status={payment.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">Stripe</TableCell>
            <TableCell
              className="text-muted-foreground text-xs"
              title={payment.transactionId ?? undefined}
            >
              {payment.transactionId ? shortId(payment.transactionId) : "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(payment.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <PaymentDetailsModal payment={payment} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
