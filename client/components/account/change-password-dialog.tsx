"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
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
import { changePassword } from "@/lib/users/actions";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validation/auth";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setSubmitting(true);
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    setSubmitting(false);

    if (result.error) {
      toast.error("Could not change password", { description: result.error });
      return;
    }

    toast.success("Password changed");
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-none">
          <KeyRound className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle className="font-light">Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword" className="text-sm font-light">
              Current Password
            </Label>
            <PasswordInput
              id="currentPassword"
              {...register("currentPassword")}
              className="mt-2 rounded-none"
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-sm font-light">
              New Password
            </Label>
            <PasswordInput
              id="newPassword"
              {...register("newPassword")}
              className="mt-2 rounded-none"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-light">
              Confirm New Password
            </Label>
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
              className="mt-2 rounded-none"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting} className="rounded-none">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
