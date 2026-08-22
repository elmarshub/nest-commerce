"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useMyWishlist, wishlistQueryKey } from "@/lib/queries/wishlist";
import { addToWishlist, removeFromWishlist } from "@/lib/wishlist/actions";

export function useWishlist() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useMyWishlist(!!user, user?.id);

  const isInWishlist = (productId: string) =>
    items.some((item) => item.productId === productId);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: wishlistQueryKey(user?.id) });

  const add = async (productId: string) => {
    const result = await addToWishlist(productId);
    if (!result.error) invalidate();
    return result;
  };

  const remove = async (productId: string) => {
    const result = await removeFromWishlist(productId);
    if (!result.error) invalidate();
    return result;
  };

  const toggle = async (productId: string) =>
    isInWishlist(productId) ? remove(productId) : add(productId);

  return { items, isLoading, isInWishlist, add, remove, toggle };
}
