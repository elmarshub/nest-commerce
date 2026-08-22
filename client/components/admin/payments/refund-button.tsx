"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { refundPayment } from "@/lib/admin/payments/actions";

export function RefundButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();

  const handleRefund = async () => {
    const result = await refundPayment(paymentId);
    if (!result.payment) {
      toast.error("Couldn't refund payment", { description: result.error ?? undefined });
      return;
    }
    toast.success("Payment refunded");
    router.refresh();
  };

  return (
    <ConfirmDeleteDialog
      title="Refund this payment?"
      description="This issues a real Stripe refund, restocks the product, and cancels the associated order. This cannot be undone."
      confirmLabel="Refund"
      onConfirm={handleRefund}
      trigger={
        <Button variant="outline" size="sm" className="rounded-none">
          Refund
        </Button>
      }
    />
  );
}
