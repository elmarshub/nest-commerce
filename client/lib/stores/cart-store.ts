import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export type CartProduct = Pick<Product, "id" | "name" | "price" | "imageUrl">;

export interface CartItem {
  productId: string;
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  totalItems: () => number;
  subtotal: () => number;

  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((item) => item.productId === product.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
        } else {
          set({
            items: [...items, { productId: product.id, product, quantity }],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: "cart" },
  ),
);
