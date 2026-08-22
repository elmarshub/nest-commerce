"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { Review } from "@/types/review";

type ReviewResult =
  | { error: null; review: Review }
  | { error: string; review: null };

export async function createReview(
  productId: string,
  input: { rating: number; comment?: string },
): Promise<ReviewResult> {
  const { headers, error: authError } = await requireAuthHeaders(
    "Please sign in to leave a review",
  );
  if (!headers) {
    return { error: authError, review: null };
  }

  const { data, error, response } = await api.POST(
    "/api/v1/products/{productId}/reviews",
    {
      params: { path: { productId } },
      headers,
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
