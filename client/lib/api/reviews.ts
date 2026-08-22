import "server-only";
import { api } from "./client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";

export function reviewsCacheTag(productId: string) {
  return `product-reviews-${productId}`;
}

export async function getProductReviews(
  productId: string,
  query?: { page?: number; limit?: number },
) {
  const { data, error } = await api.GET("/api/v1/products/{productId}/reviews", {
    params: { path: { productId }, query },
    next: { revalidate: 60, tags: [reviewsCacheTag(productId)] },
  });

  if (error) return null;

  return data;
}

export async function getMyReviews() {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.GET("/api/v1/reviews/mine", { headers });

  if (error || !data) return null;

  return data;
}
