import "server-only";
import { api } from "./client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { Address } from "@/types/address";

export async function getMyAddresses(): Promise<Address[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  const { data, error } = await api.GET("/api/v1/addresses", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error || !data) return [];

  return data;
}
