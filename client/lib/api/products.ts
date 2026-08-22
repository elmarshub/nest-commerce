import { api, CATALOG_CACHE } from "./client";
import type { paths } from "./schema";

type FindAllProductsQuery = NonNullable<
  paths["/api/v1/products"]["get"]["parameters"]["query"]
>;

export async function getProducts(query?: FindAllProductsQuery) {
  const { data, error } = await api.GET("/api/v1/products", {
    params: { query },
    ...CATALOG_CACHE,
  });

  if (error) {
    throw new Error("Failed to load products");
  }

  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await api.GET("/api/v1/products/{id}", {
    params: { path: { id } },
    ...CATALOG_CACHE,
  });

  if (error) {
    return null;
  }

  return data;
}
