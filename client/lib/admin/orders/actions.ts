"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { OrderStatusFormValues } from "@/lib/validation/admin/order";
import type { Order } from "@/types/order";
import type { paths } from "@/lib/api/schema";

type UpdateOrderBody = NonNullable<
  paths["/api/v1/orders/admin/{id}"]["patch"]["requestBody"]
>["content"]["application/json"];

type OrderResult =
  | { error: null; order: Order }
  | { error: string; order: null };

export async function updateOrder(
  id: string,
  input: OrderStatusFormValues,
): Promise<OrderResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, order: null };
  }

  const { data, error } = await api.PATCH("/api/v1/orders/admin/{id}", {
    params: { path: { id } },
    headers,
    body: {
      status: (input.status || undefined) as UpdateOrderBody["status"],
      trackingNumber: input.trackingNumber || undefined,
      notes: input.notes || undefined,
    },
  });

  if (error || !data) {
    return { error: "Failed to update order. Please try again.", order: null };
  }

  return { error: null, order: data };
}

export async function cancelOrder(id: string): Promise<OrderResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, order: null };
  }

  const { data, error, response } = await api.DELETE("/api/v1/orders/admin/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error || !data) {
    if (response.status === 400) {
      return { error: "This order can no longer be cancelled.", order: null };
    }
    return { error: "Failed to cancel order. Please try again.", order: null };
  }

  return { error: null, order: data };
}
