"use server";

import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { Payment } from "@/types/payment";

type PaymentIntentResult =
  | { error: null; clientSecret: string; paymentId: string }
  | { error: string; clientSecret: null; paymentId: null };

export async function createPaymentIntent(
  orderId: string,
): Promise<PaymentIntentResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      error: "Please sign in to continue",
      clientSecret: null,
      paymentId: null,
    };
  }

  const { data, error } = await api.POST("/api/v1/payments/create-intent", {
    headers: { Authorization: `Bearer ${accessToken}` },
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
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const { data, error } = await api.POST("/api/v1/payments/{id}/sync", {
    params: { path: { id: paymentId } },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error || !data) return null;

  return data;
}
