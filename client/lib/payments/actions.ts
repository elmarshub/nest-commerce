"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { Payment } from "@/types/payment";

type PaymentIntentResult =
  | { error: null; clientSecret: string; paymentId: string }
  | { error: string; clientSecret: null; paymentId: null };

export async function createPaymentIntent(
  orderId: string,
): Promise<PaymentIntentResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, clientSecret: null, paymentId: null };
  }

  const { data, error } = await api.POST("/api/v1/payments/create-intent", {
    headers,
    body: { orderId },
  });

  if (error || !data) {
    return {
      error: "Failed to start payment. Please try again.",
      clientSecret: null,
      paymentId: null,
    };
  }

  return {
    error: null,
    clientSecret: data.clientSecret,
    paymentId: data.payment.id,
  };
}

export async function syncPayment(paymentId: string): Promise<Payment | null> {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.POST("/api/v1/payments/{id}/sync", {
    params: { path: { id: paymentId } },
    headers,
  });

  if (error || !data) return null;

  return data;
}
