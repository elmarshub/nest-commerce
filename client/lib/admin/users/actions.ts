"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { AdminUser } from "@/types/admin-user";

type UserResult =
  | { error: null; user: AdminUser }
  | { error: string; user: null };

type ActionResult = { error: string | null };

export async function updateUserRole(
  id: string,
  role: "USER" | "ADMIN" | "DRIVER",
): Promise<UserResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError, user: null };
  }

  const { data, error, response } = await api.PATCH("/api/v1/users/{id}/role", {
    params: { path: { id } },
    headers,
    body: { role },
  });

  if (error || !data) {
    if (response.status === 400) {
      return { error: "You cannot change your own role.", user: null };
    }
    return { error: "Failed to update role. Please try again.", user: null };
  }

  return { error: null, user: data };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError };
  }

  const { error } = await api.DELETE("/api/v1/users/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) {
    return { error: "Failed to delete user. Please try again." };
  }

  return { error: null };
}
