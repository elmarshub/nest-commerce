"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/stores/cart-store";

export function ClearCartOnSuccess() {
  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);

  return null;
}
