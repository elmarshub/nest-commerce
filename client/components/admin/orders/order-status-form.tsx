"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  orderStatusSchema,
  type OrderStatusFormValues,
} from "@/lib/validation/admin/order";
import { updateOrder } from "@/lib/admin/orders/actions";
import type { Order } from "@/types/order";

export function OrderStatusForm({
  order,
  statusOptions,
}: {
  order: Order;
  statusOptions: string[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(order.status);

  const {
    register,
    handleSubmit,
  } = useForm<OrderStatusFormValues>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      trackingNumber: order.trackingNumber ?? "",
      notes: order.notes ?? "",
    },
  });

  const onSubmit = async (data: OrderStatusFormValues) => {
    setSubmitting(true);
    const result = await updateOrder(order.id, { ...data, status });
    setSubmitting(false);

    if (!result.order) {
      toast.error("Something went wrong", { description: result.error ?? undefined });
      return;
    }

    toast.success("Order updated");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-muted/20 p-8 space-y-6">
      <h2 className="text-lg font-light text-foreground">Update Order</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-light">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-2 w-full rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="trackingNumber" className="text-sm font-light">
            Tracking Number
          </Label>
          <Input
            id="trackingNumber"
            {...register("trackingNumber")}
            className="mt-2 rounded-none"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes" className="text-sm font-light">
            Notes
          </Label>
          <Textarea
            id="notes"
            {...register("notes")}
            className="mt-2 rounded-none"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={submitting} className="rounded-none">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
