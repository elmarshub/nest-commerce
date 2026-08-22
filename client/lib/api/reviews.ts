import { api, CATALOG_CACHE } from "./client";

export async function getProductReviews(productId: string) {
  const { data, error } = await api.GET("/api/v1/products/{productId}/reviews", {
    params: { path: { productId } },
    ...CATALOG_CACHE,
  });

  if (error) return null;

  return data;
}
