"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewProduct } from "./review-product";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";

const CustomStar = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-3 h-3 ${filled ? "text-foreground" : "text-muted-foreground/30"}`}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

function Accordion({
  label,
  isOpen,
  onToggle,
  children,
  extra,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
      >
        <div className="flex items-center gap-3">
          <span>{label}</span>
          {extra}
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      {isOpen && <div className="pb-6 space-y-4">{children}</div>}
    </div>
  );
}

export function ProductDescription({
  product,
  reviews,
  reviewsError = false,
}: {
  product: Product;
  reviews: Review[];
  reviewsError?: boolean;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (section: string) =>
    setOpenSection((current) => (current === section ? null : section));

  const roundedRating = product.averageRating ? Math.round(product.averageRating) : 0;

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      <Accordion label="Product Details" isOpen={openSection === "details"} onToggle={() => toggle("details")}>
        <div className="flex justify-between">
          <span className="text-sm font-light text-muted-foreground">SKU</span>
          <span className="text-sm font-light text-foreground">{product.sku}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-light text-muted-foreground">Category</span>
          <span className="text-sm font-light text-foreground">{product.category.name}</span>
        </div>
      </Accordion>

      <Accordion label="Care & Cleaning" isOpen={openSection === "care"} onToggle={() => toggle("care")}>
        <ul className="space-y-2">
          <li className="text-sm font-light text-muted-foreground">
            • Clean with a soft, dry cloth after each wear
          </li>
          <li className="text-sm font-light text-muted-foreground">
            • Avoid contact with perfumes, lotions, and cleaning products
          </li>
          <li className="text-sm font-light text-muted-foreground">
            • Store in the provided jewelry pouch when not wearing
          </li>
          <li className="text-sm font-light text-muted-foreground">
            • Remove before swimming, exercising, or showering
          </li>
        </ul>
      </Accordion>

      <div className="border-b border-border lg:mb-16">
        <Button
          variant="ghost"
          onClick={() => toggle("reviews")}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <div className="flex items-center gap-3">
            <span>Customer Reviews</span>
            {product.reviewCount > 0 && (
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <CustomStar key={star} filled={star <= roundedRating} />
                ))}
                <span className="text-sm font-light text-muted-foreground ml-1">
                  {product.averageRating?.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          {openSection === "reviews" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {openSection === "reviews" && (
          <div className="pb-6 space-y-6">
            <ReviewProduct productId={product.id} />

            {reviewsError ? (
              <p className="text-sm font-light text-muted-foreground">
                Reviews couldn&apos;t be loaded right now. Please refresh to try again.
              </p>
            ) : reviews.length === 0 ? (
              <p className="text-sm font-light text-muted-foreground">
                No reviews yet — be the first to review this piece.
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <CustomStar key={star} filled={star <= review.rating} />
                        ))}
                      </div>
                      <span className="text-sm font-light text-muted-foreground">
                        {review.userName}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm font-light text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
