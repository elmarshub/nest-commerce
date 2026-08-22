"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/stores/auth-store";
import { deleteAccount } from "@/lib/users/actions";

export function DeleteAccountDialog() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await deleteAccount(password);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      await signOut();
      toast.success("Account deleted");
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPassword("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle className="font-light">Delete Account</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This permanently deletes your account and cannot be undone. Enter
          your password to confirm.
        </p>
        <div>
          <Label htmlFor="deleteAccountPassword" className="text-sm font-light">
            Password
          </Label>
          <PasswordInput
            id="deleteAccountPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 rounded-none"
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            disabled={!password || submitting}
            onClick={handleDelete}
            className="rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete My Account"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
