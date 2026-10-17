"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { cancelOrder } from "@/lib/admin/orders/actions";

// the API only lets admins cancel orders that have not been delivered
const CANCELLABLE_STATUSES = ["PENDING", "PROCESSING", "SHIPPED"];

export function CancelOrderButton({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();

  if (!CANCELLABLE_STATUSES.includes(status)) return null;

  const handleCancel = async () => {
    const result = await cancelOrder(orderId);
    if (!result.order) {
      toast.error("Couldn't cancel order", { description: result.error ?? undefined });
      return;
    }
    toast.success("Order cancelled");
    router.refresh();
  };

  return (
    <ConfirmDeleteDialog
      title="Cancel this order?"
      description="The customer's order will be marked as cancelled. This cannot be undone."
      confirmLabel="Cancel Order"
      onConfirm={handleCancel}
      trigger={
        <Button variant="destructive" className="rounded-none">
          Cancel Order
        </Button>
      }
    />
  );
}
