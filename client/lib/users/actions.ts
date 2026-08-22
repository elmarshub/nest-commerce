"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { CurrentUser } from "@/lib/auth/session";

type UpdateProfileResult =
  | { error: null; user: CurrentUser }
  | { error: string; user: null };

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<UpdateProfileResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, user: null };
  }

  const { data, error } = await api.PATCH("/api/v1/users/me", {
    headers,
    body: input,
  });

  if (error || !data) {
    return { error: "Failed to update profile. Please try again.", user: null };
  }

  return {
    error: null,
    user: {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      role: data.role,
    },
  };
}

export async function uploadAvatar(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, user: null };
  }

  const { data, error } = await api.POST("/api/v1/uploads/avatar", {
    headers,
    // openapi-fetch passes FormData through untouched (it lets the browser
    // set the multipart Content-Type/boundary); the generated body type
    // models the multipart schema shape instead, hence the cast.
    body: formData as unknown as { file?: string },
  });

  if (error || !data) {
    return { error: "Failed to upload image. Please try again.", user: null };
  }

  return updateProfile({ avatarUrl: data.url });
}
