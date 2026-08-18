"use server";

import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokens";
import type { Address } from "@/types/address";
import type { AddressFormValues } from "@/lib/validation/address";

type AddressResult =
  | { error: null; address: Address }
  | { error: string; address: null };

type DeleteResult = { error: string | null };

export async function createAddress(
  input: AddressFormValues,
): Promise<AddressResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in", address: null };
  }

  const { data, error } = await api.POST("/api/v1/addresses", {
    headers: { Authorization: `Bearer ${accessToken}` },
    body: input,
  });

  if (error || !data) {
    return { error: "Failed to save address. Please try again.", address: null };
  }

  return { error: null, address: data };
}

export async function updateAddress(
  id: string,
  input: AddressFormValues,
): Promise<AddressResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in", address: null };
  }

  const { data, error } = await api.PATCH("/api/v1/addresses/{id}", {
    params: { path: { id } },
    headers: { Authorization: `Bearer ${accessToken}` },
    body: input,
  });

  if (error || !data) {
    return {
      error: "Failed to update address. Please try again.",
      address: null,
    };
  }

  return { error: null, address: data };
}

export async function deleteAddress(id: string): Promise<DeleteResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { error: "Please sign in" };
  }

  const { error } = await api.DELETE("/api/v1/addresses/{id}", {
    params: { path: { id } },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) {
    return { error: "Failed to delete address. Please try again." };
  }

  return { error: null };
}
