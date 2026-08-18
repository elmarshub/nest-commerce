import { api } from "./client";

export async function getCategories() {
  const { data, error } = await api.GET("/api/v1/categories");

  if (error) {
    throw new Error("Failed to load categories");
  }

  return data;
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await api.GET("/api/v1/categories/slug/{slug}", {
    params: { path: { slug } },
  });

  if (error) {
    return null;
  }

  return data;
}
