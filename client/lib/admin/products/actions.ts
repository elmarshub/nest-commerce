"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { ProductFormValues } from "@/lib/validation/admin/product";
import type { Product } from "@/types/product";

type ProductResult =
  | { error: null; product: Product }
  | { error: string; product: null };

type ActionResult = { error: string | null };

function toBody(input: ProductFormValues) {
  return {
    ...input,
    imageUrl: input.imageUrl || undefined,
  };
}

export async function createProduct(
  input: ProductFormValues,
): Promise<ProductResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, product: null };
  }

  const { data, error } = await api.POST("/api/v1/products", {
    headers,
    body: toBody(input),
  });

  if (error || !data) {
    return { error: "Failed to create product. Please try again.", product: null };
  }

  return { error: null, product: data };
}

export async function updateProduct(
  id: string,
  input: ProductFormValues,
): Promise<ProductResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, product: null };
  }

  const { data, error } = await api.PATCH("/api/v1/products/{id}", {
    params: { path: { id } },
    headers,
    body: toBody(input),
  });

  if (error || !data) {
    return { error: "Failed to update product. Please try again.", product: null };
  }

  return { error: null, product: data };
}

export async function adjustProductStock(
  id: string,
  quantity: number,
  operation: "set" | "increment" | "decrement" = "set",
): Promise<ProductResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, product: null };
  }

  const { data, error } = await api.PATCH("/api/v1/products/{id}/stock", {
    params: { path: { id } },
    headers,
    body: { quantity, operation },
  });

  if (error || !data) {
    return { error: "Failed to update stock. Please try again.", product: null };
  }

  return { error: null, product: data };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError };
  }

  const { error, response } = await api.DELETE("/api/v1/products/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) {
    if (response.status === 409) {
      return {
        error: "Cannot delete a product that has existing orders.",
      };
    }
    return { error: "Failed to delete product. Please try again." };
  }

  return { error: null };
}
