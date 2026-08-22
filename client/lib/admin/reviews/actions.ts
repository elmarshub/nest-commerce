"use server";

import { updateTag } from "next/cache";
import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import { reviewsCacheTag } from "@/lib/api/reviews";
import type { Review } from "@/types/review";

type ActionResult = { error: string | null };

type ReplyReviewResult =
  | { error: null; review: Review }
  | { error: string; review: null };

export async function replyToReview(
  id: string,
  reply: string,
): Promise<ReplyReviewResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, review: null };
  }

  const { data, error } = await api.PATCH("/api/v1/reviews/{id}/reply", {
    params: { path: { id } },
    headers,
    body: { reply },
  });

  if (error || !data) {
    return { error: "Failed to send reply. Please try again.", review: null };
  }

  updateTag(reviewsCacheTag(data.productId));
  return { error: null, review: data };
}

export async function deleteReply(
  id: string,
  productId?: string,
): Promise<ReplyReviewResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, review: null };
  }

  const { data, error } = await api.DELETE("/api/v1/reviews/{id}/reply", {
    params: { path: { id } },
    headers,
  });

  if (error || !data) {
    return { error: "Failed to delete reply. Please try again.", review: null };
  }

  updateTag(reviewsCacheTag(productId ?? data.productId));
  return { error: null, review: data };
}

export async function deleteReview(
  id: string,
  productId?: string,
): Promise<ActionResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError };
  }

  const { error } = await api.DELETE("/api/v1/reviews/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) {
    return { error: "Failed to delete review. Please try again." };
  }

  if (productId) {
    updateTag(reviewsCacheTag(productId));
  }

  return { error: null };
}
