"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { Payment } from "@/types/payment";

type CheckoutSessionResult =
  | { error: null; url: string }
  | { error: string; url: null };

export async function createCheckoutSession(
  orderId: string,
): Promise<CheckoutSessionResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, url: null };
  }

  const { data, error } = await api.POST(
    "/api/v1/payments/create-checkout-session",
    {
      headers,
      body: { orderId },
    },
  );

  if (error || !data) {
    return {
      error: "Failed to start payment. Please try again.",
      url: null,
    };
  }

  return { error: null, url: data.url };
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

export async function getPaymentByOrderId(
  orderId: string,
): Promise<Payment | null> {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.GET("/api/v1/payments/order/{orderId}", {
    params: { path: { orderId } },
    headers,
  });

  if (error || !data) return null;

  return data;
}

export async function reconcilePaymentForOrder(
  orderId: string,
): Promise<Payment | null> {
  const payment = await getPaymentByOrderId(orderId);
  if (!payment || payment.status !== "PENDING") return payment;

  return await syncPayment(payment.id);
}
