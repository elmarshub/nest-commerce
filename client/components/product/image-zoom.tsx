"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageZoomProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageZoom({ images, initialIndex, isOpen, onClose }: ImageZoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const imageElement = scrollRef.current.children[0]?.children[initialIndex] as
        | HTMLElement
        | undefined;
      imageElement?.scrollIntoView();
    }
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 hover:bg-transparent text-white border-none p-2"
      >
        <X className="h-8 w-8" />
      </Button>

      <div ref={scrollRef} className="relative w-full h-full overflow-y-auto">
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center">
              <Image
                src={image}
                alt={`Product view ${index + 1}`}
                width={1200}
                height={1200}
                sizes="100vw"
                className="w-full max-w-none h-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
