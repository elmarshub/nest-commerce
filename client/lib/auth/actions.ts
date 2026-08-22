"use server";

import { api } from "@/lib/api/client";
import { setAuthCookies, clearAuthCookies } from "./tokens";
import { getCurrentUser, type CurrentUser } from "./session";
import { requireAuthHeaders } from "./authHeaders";

type AuthResult =
  | { error: null; user: CurrentUser }
  | { error: string; user: null };

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { data, error } = await api.POST("/api/v1/auth/login", {
    body: input,
  });

  if (error || !data) {
    return { error: "Invalid email or password", user: null };
  }

  await setAuthCookies(data);

  return { error: null, user: data.user };
}

export async function register(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResult> {
  const { data, error } = await api.POST("/api/v1/auth/register", {
    body: input,
  });

  if (error || !data) {
    return { error: "Failed to create account", user: null };
  }

  await setAuthCookies(data);

  return { error: null, user: data.user };
}

export async function logout(): Promise<void> {
  const { headers } = await requireAuthHeaders();

  if (headers) {
    await api.POST("/api/v1/auth/logout", { headers });
  }

  await clearAuthCookies();
}

export async function getSessionUser(): Promise<CurrentUser | null> {
  return getCurrentUser();
}

type MessageResult = { error: string | null };

export async function forgotPassword(input: {
  email: string;
}): Promise<MessageResult> {
  const { error } = await api.POST("/api/v1/auth/forgot-password", {
    body: input,
  });

  if (error) {
    return { error: "Something went wrong. Please try again." };
  }

  return { error: null };
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<MessageResult> {
  const { error } = await api.POST("/api/v1/auth/reset-password", {
    body: input,
  });

  if (error) {
    return {
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  return { error: null };
}
