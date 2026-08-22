"use server";

import { api } from "@/lib/api/client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";

type ActionResult = { error: string | null };

export async function deleteReview(id: string): Promise<ActionResult> {
  const { headers, error: authError } = await requireAuthHeaders();
  if (!headers) {
    return { error: authError };
  }

  const { error } = await api.DELETE("/api/v1/reviews/{id}", {
    params: { path: { id } },
    headers,
  });

  if (error) {
    return { error: "Failed to delete review. Please try again." };
  }

  return { error: null };
}
