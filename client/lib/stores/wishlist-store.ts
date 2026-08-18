import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartProduct } from "./cart-store";

interface WishlistItem {
  productId: string;
  product: CartProduct;
}

interface WishlistState {
  items: WishlistItem[];

  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: CartProduct) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (get().items.some((item) => item.productId === product.id)) return;
        set({ items: [...get().items, { productId: product.id, product }] });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      isInWishlist: (productId) =>
        get().items.some((item) => item.productId === productId),

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
    }),
    { name: "wishlist" },
  ),
);
