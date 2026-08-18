"use server";

import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { Review } from "@/types/review";

type ReviewResult =
  | { error: null; review: Review }
  | { error: string; review: null };

export async function createReview(
  productId: string,
  input: { rating: number; comment?: string },
): Promise<ReviewResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in to leave a review", review: null };
  }

  const { data, error, response } = await api.POST(
    "/api/v1/products/{productId}/reviews",
    {
      params: { path: { productId } },
      headers: { Authorization: `Bearer ${accessToken}` },
      body: input,
    },
  );

  if (error || !data) {
    if (response.status === 403) {
      return {
        error: "You can only review products you've purchased and received.",
        review: null,
      };
    }
    if (response.status === 409) {
      return { error: "You've already reviewed this product.", review: null };
    }
    return {
      error: "Failed to submit review. Please try again.",
      review: null,
    };
  }

  return { error: null, review: data };
}
