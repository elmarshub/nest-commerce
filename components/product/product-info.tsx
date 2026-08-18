"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Minus, Plus, Heart, Check } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);
  const inStock = product.stock > 0;

  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const incrementQuantity = () =>
    setQuantity((prev) => Math.min(product.stock, prev + 1));

  const handleAddToBag = () => {
    setIsAdding(true);
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    setIsAdding(false);
    setJustAdded(true);

    toast.success("Added to bag", {
      description: `${quantity}x ${product.name} has been added to your shopping bag.`,
    });

    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistToggle = () => {
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast.success(isWishlisted ? "Removed from favorites" : "Added to favorites", {
      description: isWishlisted
        ? `${product.name} has been removed from your favorites.`
        : `${product.name} has been added to your favorites.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/category/${product.category.slug}`}>
                  {product.category.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-light text-muted-foreground mb-1">
              {product.category.name}
            </p>
            <h1 className="text-2xl md:text-3xl font-light text-foreground">{product.name}</h1>
          </div>
          <p className="text-xl font-light text-foreground text-right">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      {product.description && (
        <p className="text-sm font-light text-muted-foreground">{product.description}</p>
      )}

      {!inStock && <p className="text-sm text-destructive">Currently out of stock</p>}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">Quantity</span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              disabled={!inStock}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              disabled={!inStock}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleAddToBag}
              disabled={isAdding || !inStock}
              className={cn(
                "w-full h-12 font-light rounded-none transition-all duration-300",
                justAdded
                  ? "bg-green-600 text-white hover:bg-green-600"
                  : "bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              {justAdded ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Added to Bag
                </span>
              ) : isAdding ? (
                "Adding..."
              ) : !inStock ? (
                "Out of Stock"
              ) : (
                "Add to Bag"
              )}
            </Button>
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleWishlistToggle}
            className="h-12 w-12 rounded-none border-border"
          >
            <Heart className={cn("h-5 w-5 transition-colors", isWishlisted && "fill-foreground")} />
          </Button>
        </div>
      </div>
    </div>
  );
}
