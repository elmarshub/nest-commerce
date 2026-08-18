"use server";

import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import * as cartApi from "@/lib/api/cart";
import type { Order } from "@/types/order";

type CheckoutResult =
  | { error: null; order: Order }
  | { error: string; order: null };

export async function checkout(input: {
  items: { productId: string; quantity: number }[];
  shippingAddress: string;
}): Promise<CheckoutResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in to check out", order: null };
  }

  // The local (guest-friendly) cart is the source of truth up to this point,
  // so reset the server cart before replaying it — otherwise a retried
  // checkout would re-add items on top of quantities left by a prior attempt.
  const clearedCart = await cartApi.clearCart(accessToken);
  if (!clearedCart) {
    return {
      error: "Failed to prepare your cart. Please try again.",
      order: null,
    };
  }

  for (const item of input.items) {
    const updatedCart = await cartApi.addCartItem(accessToken, item);
    if (!updatedCart) {
      return {
        error: "Failed to prepare your cart. Please try again.",
        order: null,
      };
    }
  }

  const { data, error } = await api.POST("/api/v1/orders", {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { shippingAddress: input.shippingAddress },
  });

  if (error || !data) {
    return { error: "Checkout failed. Please try again.", order: null };
  }

  return { error: null, order: data };
}
