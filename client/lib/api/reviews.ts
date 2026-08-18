import { api } from "./client";

export async function getProductReviews(productId: string) {
  const { data, error } = await api.GET("/api/v1/products/{productId}/reviews", {
    params: { path: { productId } },
  });

  if (error) {
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }

  return data;
}
