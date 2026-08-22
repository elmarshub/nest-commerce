"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteReview, deleteReply, replyToReview } from "@/lib/admin/reviews/actions";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types/review";

function ReviewReply({ review }: { review: Review }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.reply ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!draft.trim()) return;
    setSubmitting(true);
    const result = await replyToReview(review.id, draft.trim());
    setSubmitting(false);
    if (result.error) {
      toast.error("Couldn't send reply", { description: result.error });
      return;
    }
    toast.success("Reply sent");
    setEditing(false);
    router.refresh();
  };

  const handleDeleteReply = async () => {
    const result = await deleteReply(review.id, review.productId);
    if (result.error) {
      toast.error("Couldn't delete reply", { description: result.error });
      return;
    }
    toast.success("Reply deleted");
    setDraft("");
    router.refresh();
  };

  if (!editing) {
    if (review.reply) {
      return (
        <div className="mt-3 border-l-2 border-primary/30 pl-3">
          <p className="text-xs font-medium text-foreground">
            Haven&apos;s reply
            {review.repliedAt && (
              <span className="ml-2 text-muted-foreground font-normal">
                {formatDate(review.repliedAt)}
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{review.reply}</p>
          <div className="flex items-center gap-3 mt-1">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => setEditing(true)}
            >
              Edit reply
            </Button>
            <ConfirmDeleteDialog
              title="Delete this reply?"
              description="Haven's reply will be removed. This cannot be undone."
              onConfirm={handleDeleteReply}
              trigger={
                <Button variant="link" size="sm" className="h-auto p-0 text-destructive">
                  Delete reply
                </Button>
              }
            />
          </div>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => setEditing(true)}
      >
        Reply
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write a reply as Haven..."
        maxLength={2000}
        rows={3}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !draft.trim()}>
          {submitting ? "Sending..." : "Send reply"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDraft(review.reply ?? "");
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const router = useRouter();

  const handleDelete = async (id: string, productId: string) => {
    const result = await deleteReview(id, productId);
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
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {review.userName} — {review.rating}/5
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </p>
              {review.comment && (
                <p className="text-sm text-foreground mt-2">{review.comment}</p>
              )}
              <ReviewReply review={review} />
            </div>
            <ConfirmDeleteDialog
              title="Delete this review?"
              description="This review will be permanently deleted. This cannot be undone."
              onConfirm={() => handleDelete(review.id, review.productId)}
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
