"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { createReview } from "@/lib/reviews/actions";

const CustomStar = ({
  filled,
  onClick,
}: {
  filled: boolean;
  onClick: () => void;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-5 h-5 cursor-pointer ${filled ? "text-foreground" : "text-muted-foreground/30"}`}
    onClick={onClick}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

export function ReviewProduct({ productId }: { productId: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthModalStore((state) => state.open);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsOpen(true);
  };

  const submitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const result = await createReview(productId, {
      rating,
      comment: comment.trim() || undefined,
    });
    setIsSubmitting(false);

    if (!result.review) {
      toast.error("Couldn't submit review", {
        description: result.error ?? undefined,
      });
      return;
    }

    toast.success("Review submitted", {
      description: "Thanks for your feedback!",
    });
    setIsOpen(false);
    setRating(0);
    setComment("");
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="w-full h-12 font-light rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
      >
        Review product
      </Button>
      <DialogContent className="sm:max-w-md rounded-none!">
        <DialogHeader>
          <DialogTitle className="font-light text-xl">
            Review product
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-light text-foreground">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar
                  key={star}
                  filled={star <= rating}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-light text-foreground">
              Your review
            </label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your thoughts about this product..."
              className="min-h-24 resize-none rounded-none font-light"
            />
          </div>

          <Button
            onClick={submitReview}
            disabled={isSubmitting}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
