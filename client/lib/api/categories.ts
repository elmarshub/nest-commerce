import { api, CATALOG_CACHE } from "./client";

export async function getCategories() {
  const { data, error } = await api.GET("/api/v1/categories", CATALOG_CACHE);

  if (error) {
    throw new Error("Failed to load categories");
  }

  return data;
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await api.GET("/api/v1/categories/slug/{slug}", {
    params: { path: { slug } },
    ...CATALOG_CACHE,
  });

  if (error) {
    return null;
  }

  return data;
}
