"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { WishlistItem } from "@/types/wishlist";

type WishlistResult =
  | { error: null; item: WishlistItem }
  | { error: string; item: null };

type DeleteResult = { error: string | null };

export async function addToWishlist(productId: string): Promise<WishlistResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, item: null };
  }

  const { data, error } = await api.POST("/api/v1/wishlist", {
    headers,
    body: { productId },
  });

  if (error || !data) {
    return { error: "Failed to add to wishlist. Please try again.", item: null };
  }

  return { error: null, item: data };
}

export async function removeFromWishlist(productId: string): Promise<DeleteResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError };
  }

  const { error } = await api.DELETE("/api/v1/wishlist/{productId}", {
    params: { path: { productId } },
    headers,
  });

  if (error) {
    return { error: "Failed to remove from wishlist. Please try again." };
  }

  return { error: null };
}
