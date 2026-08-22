"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";

type UploadResult = { error: string | null; url: string | null };

async function uploadImage(
  path: "/api/v1/uploads/product-image" | "/api/v1/uploads/category-image",
  formData: FormData,
): Promise<UploadResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, url: null };
  }

  const { data, error } = await api.POST(path, {
    headers,
    // openapi-fetch passes FormData through untouched (it lets the browser
    // set the multipart Content-Type/boundary); the generated body type
    // models the multipart schema shape instead, hence the cast.
    body: formData as unknown as { file?: string },
  });

  if (error || !data) {
    return { error: "Failed to upload image. Please try again.", url: null };
  }

  return { error: null, url: data.url };
}

export async function uploadProductImage(
  formData: FormData,
): Promise<UploadResult> {
  return uploadImage("/api/v1/uploads/product-image", formData);
}

export async function uploadCategoryImage(
  formData: FormData,
): Promise<UploadResult> {
  return uploadImage("/api/v1/uploads/category-image", formData);
}
