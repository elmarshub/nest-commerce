"use client";

import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/admin/payments/payment-status-badge";
import { RefundButton } from "@/components/admin/payments/refund-button";
import { formatDate } from "@/lib/format";
import type { Payment } from "@/types/payment";

const currencyFormat = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export function PaymentDetailsModal({ payment }: { payment: Payment }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-light">Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-foreground">
              {currencyFormat(payment.amount, payment.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="text-foreground">Stripe</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground">{formatDate(payment.createdAt)}</span>
          </div>
          <div>
            <p className="text-muted-foreground">Order ID</p>
            <p className="text-foreground break-all text-xs mt-1">{payment.orderId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Transaction ID</p>
            <p className="text-foreground break-all text-xs mt-1">
              {payment.transactionId ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment ID</p>
            <p className="text-foreground break-all text-xs mt-1">{payment.id}</p>
          </div>
          {payment.status === "COMPLETED" && (
            <div className="flex justify-end pt-2 border-t border-border">
              <RefundButton paymentId={payment.id} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
