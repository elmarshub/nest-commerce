"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { Payment } from "@/types/payment";

type PaymentResult =
  | { error: null; payment: Payment }
  | { error: string; payment: null };

export async function refundPayment(id: string): Promise<PaymentResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, payment: null };
  }

  const { data, error, response } = await api.POST("/api/v1/payments/{id}/refund", {
    params: { path: { id } },
    headers,
  });

  if (error || !data) {
    if (response.status === 400) {
      return { error: "This payment is not in a refundable state.", payment: null };
    }
    return { error: "Failed to refund payment. Please try again.", payment: null };
  }

  return { error: null, payment: data };
}
