import { api, CATALOG_CACHE } from "./client";

export type ApiEnums = {
  Role: string[];
  OrderStatus: string[];
  PaymentStatus: string[];
};

export async function getEnums(): Promise<ApiEnums | null> {
  const { data, error } = await api.GET("/api/v1/meta/enums", CATALOG_CACHE);

  if (error || !data) return null;

  return data as ApiEnums;
}

export async function getRoles(): Promise<string[] | null> {
  const { data, error } = await api.GET("/api/v1/meta/roles", CATALOG_CACHE);

  if (error || !data) return null;

  return data;
}
