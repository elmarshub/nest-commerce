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

type MessageResult = { error: null; message: string } | { error: string; message: null };

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<MessageResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, message: null };
  }

  const { error, response } = await api.PATCH("/api/v1/users/me/password", {
    headers,
    body: input,
  });

  if (error) {
    if (response.status === 401) {
      return { error: "Current password is incorrect.", message: null };
    }
    return { error: "Failed to change password. Please try again.", message: null };
  }

  return { error: null, message: "Password changed successfully" };
}

export async function deleteAccount(password: string): Promise<MessageResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, message: null };
  }

  const { error, response } = await api.DELETE("/api/v1/users/me", {
    headers,
    body: { password },
  });

  if (error) {
    if (response.status === 401) {
      return { error: "Password is incorrect.", message: null };
    }
    return { error: "Failed to delete account. Please try again.", message: null };
  }

  return { error: null, message: "Account deleted successfully" };
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
