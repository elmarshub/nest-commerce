"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { CategoryFormValues } from "@/lib/validation/admin/category";
import type { Category } from "@/types/category";

type CategoryResult =
  | { error: null; category: Category }
  | { error: string; category: null };

type ActionResult = { error: string | null };

function toBody(input: CategoryFormValues) {
  return {
    ...input,
    slug: input.slug || undefined,
    imageUrl: input.imageUrl || undefined,
  };
}

export async function createCategory(
  input: CategoryFormValues,
): Promise<CategoryResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, category: null };
  }

  const { data, error } = await api.POST("/api/v1/categories", {
    headers,
    body: toBody(input),
  });

  if (error || !data) {
    return { error: "Failed to create category. Please try again.", category: null };
  }

  return { error: null, category: data };
}

export async function updateCategory(
  id: string,
  input: CategoryFormValues,
): Promise<CategoryResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, category: null };
  }

  const { data, error } = await api.PATCH("/api/v1/categories/{id}", {
    params: { path: { id } },
    headers,
    body: toBody(input),
  });

  if (error || !data) {
    return { error: "Failed to update category. Please try again.", category: null };
  }

  return { error: null, category: data };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError };
  }

  const { error, response } = await api.DELETE("/api/v1/categories/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) {
    if (response.status === 409) {
      return { error: "Cannot delete a category that still has products." };
    }
    return { error: "Failed to delete category. Please try again." };
  }

  return { error: null };
}
