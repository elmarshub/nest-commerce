"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/format";

interface ShoppingBagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingBagDrawer({ isOpen, onClose }: ShoppingBagDrawerProps) {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const cartSubtotal = subtotal();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 h-screen"
          onClick={onClose}
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-screen w-96 max-w-full bg-background border-l border-border flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-light text-foreground">
              Shopping Bag ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-sm text-center">
                  Your shopping bag is empty.
                  <br />
                  Continue shopping to add items to your bag.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 bg-muted/10 overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote product photography domains aren't finalized yet
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm font-light text-foreground ml-2 flex-shrink-0">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="p-2 hover:bg-muted/50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-2 text-sm font-light min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="p-2 hover:bg-muted/50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-foreground">Subtotal</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Shipping and taxes calculated at checkout
                  </p>

                  <Button
                    asChild
                    className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
                    size="lg"
                    onClick={onClose}
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full rounded-none"
                    size="lg"
                    onClick={onClose}
                    asChild
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
