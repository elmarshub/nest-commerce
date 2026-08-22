"use server";

import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import * as cartApi from "@/lib/api/cart";
import type { Order } from "@/types/order";

type CheckoutResult =
  | { error: null; order: Order }
  | { error: string; order: null };

const CART_PREPARE_ERROR = "Failed to prepare your cart. Please try again.";

export async function checkout(input: {
  items: { productId: string; quantity: number }[];
  shippingAddress: string;
}): Promise<CheckoutResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in to check out", order: null };
  }

  const clearedCart = await cartApi.clearCart(accessToken);
  if (!clearedCart) {
    return { error: CART_PREPARE_ERROR, order: null };
  }

  for (const item of input.items) {
    const updatedCart = await cartApi.addCartItem(accessToken, item);
    if (!updatedCart) {
      await cartApi.clearCart(accessToken);
      return { error: CART_PREPARE_ERROR, order: null };
    }
  }

  const { data, error } = await api.POST("/api/v1/orders", {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { shippingAddress: input.shippingAddress },
  });

  if (error || !data) {
    await cartApi.clearCart(accessToken);
    return { error: "Checkout failed. Please try again.", order: null };
  }

  return { error: null, order: data };
}
