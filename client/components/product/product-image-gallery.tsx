"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageZoom } from "./image-zoom";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const productImages = images.length > 0 ? images : ["/placeholder.svg"];

  const handleImageClick = (index: number) => {
    setZoomInitialIndex(index);
    setIsZoomOpen(true);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const difference = touchStartX.current - touchEndX.current;
    if (Math.abs(difference) > 50) {
      setCurrentImageIndex((prev) =>
        difference > 0
          ? (prev + 1) % productImages.length
          : (prev - 1 + productImages.length) % productImages.length,
      );
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full">
      <div className="hidden lg:block">
        <div className="space-y-4">
          {productImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full aspect-square overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote product photography domains aren't finalized yet */}
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full aspect-square overflow-hidden cursor-pointer group touch-pan-y"
              onClick={() => handleImageClick(currentImageIndex)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote product photography domains aren't finalized yet */}
              <img
                src={productImages[currentImageIndex]}
                alt={`${productName} view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover select-none"
              />
            </motion.div>
          </AnimatePresence>

          {productImages.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-foreground" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageZoom
        images={productImages}
        initialIndex={zoomInitialIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
}
