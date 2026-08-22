import "server-only";
import { api } from "./client";
import { requireAuthHeaders } from "@/lib/auth/authHeaders";
import type { WishlistItem } from "@/types/wishlist";

export async function getMyWishlist(): Promise<WishlistItem[] | null> {
  const { headers } = await requireAuthHeaders();
  if (!headers) return null;

  const { data, error } = await api.GET("/api/v1/wishlist", { headers });

  if (error) throw new Error("Failed to load wishlist");

  return data ?? [];
}
