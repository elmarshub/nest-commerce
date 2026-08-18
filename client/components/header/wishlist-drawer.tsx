"use client";

import { X, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/format";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (item: (typeof items)[number]) => {
    addToCart(item.product);
    toast.success("Added to bag", {
      description: `${item.product.name} has been added to your shopping bag.`,
    });
  };

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
              Your Favorites ({items.length})
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
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    You haven&apos;t added any favorites yet.
                  </p>
                  <Link
                    href="/"
                    onClick={onClose}
                    className="text-sm text-foreground underline hover:no-underline"
                  >
                    Browse our collection
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6">
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4"
                  >
                    <Link
                      href={`/product/${item.productId}`}
                      onClick={onClose}
                      className="w-20 h-20 bg-muted/10 overflow-hidden flex-shrink-0"
                    >
                      {item.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote product photography domains aren't finalized yet
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        onClick={onClose}
                        className="block"
                      >
                        <h3 className="text-sm font-medium text-foreground truncate hover:underline">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm font-light text-muted-foreground mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border hover:border-foreground transition-colors"
                        >
                          <ShoppingBag size={12} />
                          Add to Bag
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove from favorites"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
