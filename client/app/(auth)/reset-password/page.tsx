"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { resetPassword } from "@/lib/auth/actions";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validation/auth";

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    const { error } = await resetPassword({
      token,
      newPassword: data.newPassword,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error("Couldn't reset password", { description: error });
      return;
    }

    toast.success("Password reset", {
      description: "Sign in with your new password.",
    });
    router.push("/");
    openAuthModal("login");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="newPassword" className="text-sm font-light">
            New Password
          </FieldLabel>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
            className="rounded-none"
            placeholder="••••••••"
          />
          <FieldError errors={[errors.newPassword]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-sm font-light"
          >
            Confirm New Password
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="rounded-none"
            placeholder="••••••••"
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-light text-foreground mb-2 text-center">
          Reset Password
        </h1>

        {token ? (
          <>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              Choose a new password for your account.
            </p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-8">
              This reset link is invalid or missing. Please request a new
              one.
            </p>
            <Button asChild className="rounded-none">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
