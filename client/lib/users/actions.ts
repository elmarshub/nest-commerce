"use server";

import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { CurrentUser } from "@/lib/auth/session";

type UpdateProfileResult =
  | { error: null; user: CurrentUser }
  | { error: string; user: null };

export async function updateProfile(input: {
  firstName: string;
  lastName?: string;
}): Promise<UpdateProfileResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in", user: null };
  }

  const { data, error } = await api.PATCH("/api/v1/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
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
      role: data.role,
    },
  };
}
