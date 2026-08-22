"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { formatPrice } from "@/lib/format";
import { useSearchProducts } from "@/lib/queries/products";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = ["Rings", "Necklaces", "Earrings", "Bracelets"];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: results = [], isFetching: isLoading } =
    useSearchProducts(debouncedSearch);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleProductClick = (id: string) => {
    router.push(`/product/${id}`);
    onClose();
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-full left-0 right-0 bg-background border-b border-border z-50"
        onKeyDown={(event) => event.key === "Escape" && onClose()}
      >
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-8">
              <div className="flex items-center border-b border-border pb-2">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for jewelry..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg font-light"
                />
                {isLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                )}
                {searchTerm && !isLoading && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {debouncedSearch && results.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-light text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="text-left group"
                    >
                      <div className="relative aspect-square mb-2 overflow-hidden bg-muted/10">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(min-width: 768px) 25vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : null}
                      </div>
                      <p className="text-sm font-medium text-foreground group-hover:underline">
                        {product.name}
                      </p>
                      <p className="text-sm font-light text-muted-foreground">
                        {formatPrice(product.price)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : debouncedSearch && !isLoading ? (
              <p className="text-center text-muted-foreground">
                No products found for &quot;{debouncedSearch}&quot;
              </p>
            ) : (
              <div>
                <h3 className="text-sm font-light text-muted-foreground mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setSearchTerm(search)}
                      className="text-foreground hover:text-muted-foreground text-sm font-light py-2 px-4 border border-border rounded-full transition-colors duration-200 hover:border-foreground"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
