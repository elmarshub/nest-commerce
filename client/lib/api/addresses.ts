import "server-only";
import { api } from "./client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { Address } from "@/types/address";

export async function getMyAddresses(): Promise<Address[] | null> {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.GET("/api/v1/addresses", { headers });

  if (error || !data) return null;

  return data;
}
