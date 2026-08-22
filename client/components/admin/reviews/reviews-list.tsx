"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteReview } from "@/lib/admin/reviews/actions";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/review";

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const result = await deleteReview(id);
    if (result.error) {
      toast.error("Couldn't delete review", { description: result.error });
      return;
    }
    toast.success("Review deleted");
    router.refresh();
  };

  if (reviews.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No reviews for this product.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border border-muted-foreground/20 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                {review.userName} — {review.rating}/5
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </p>
              {review.comment && (
                <p className="text-sm text-foreground mt-2">{review.comment}</p>
              )}
            </div>
            <ConfirmDeleteDialog
              title="Delete this review?"
              description="This review will be permanently deleted. This cannot be undone."
              onConfirm={() => handleDelete(review.id)}
              trigger={
                <Button variant="ghost" size="icon-sm">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
