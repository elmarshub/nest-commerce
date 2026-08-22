import { useQuery } from "@tanstack/react-query";
import type { WishlistItem } from "@/types/wishlist";

async function fetchMyWishlist(): Promise<WishlistItem[]> {
  const response = await fetch("/api/wishlist");
  const json: { data: WishlistItem[] } = await response.json();
  return json.data;
}

export function wishlistQueryKey(userId?: string) {
  return ["wishlist", "me", userId ?? "anon"] as const;
}

export function useMyWishlist(enabled: boolean, userId?: string) {
  return useQuery({
    queryKey: wishlistQueryKey(userId),
    queryFn: fetchMyWishlist,
    enabled,
  });
}
