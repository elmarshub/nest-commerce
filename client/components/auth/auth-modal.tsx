"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { forgotPassword } from "@/lib/auth/actions";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  type LoginFormValues,
  type SignupFormValues,
  type ForgotPasswordFormValues,
} from "@/lib/validation/auth";

export function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModalStore();
  const { signIn, signUp, isLoading } = useAuthStore();
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-detection for createPortal has no non-effect equivalent
  useEffect(() => setMounted(true), []);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleLogin = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast.error("Login failed", { description: error });
    } else {
      toast.success("Welcome back!");
      close();
      loginForm.reset();
    }
  };

  const handleSignup = async (data: SignupFormValues) => {
    const { error } = await signUp(data.email, data.password, data.fullName);
    if (error) {
      toast.error("Sign up failed", { description: error });
    } else {
      toast.success("Account created!", { description: "You're all set." });
      close();
      signupForm.reset();
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormValues) => {
    setIsSendingReset(true);
    await forgotPassword(data);
    setIsSendingReset(false);
    toast.success("Check your email", {
      description: "If that email has an account, we've sent a reset link.",
    });
    forgotPasswordForm.reset();
    setMode("login");
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={close}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-background p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-light text-foreground">
              {mode === "login"
                ? "Sign In"
                : mode === "signup"
                  ? "Create Account"
                  : "Reset Password"}
            </h2>
            <button
              onClick={close}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {mode === "login" ? (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-6"
            >
              <FieldGroup>
                <Field data-invalid={!!loginForm.formState.errors.email}>
                  <FieldLabel htmlFor="email" className="text-sm font-light">
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register("email")}
                    className="rounded-none"
                    placeholder="your@email.com"
                  />
                  <FieldError errors={[loginForm.formState.errors.email]} />
                </Field>

                <Field data-invalid={!!loginForm.formState.errors.password}>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-light"
                  >
                    Password
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="rounded-none"
                    placeholder="••••••••"
                  />
                  <FieldError
                    errors={[loginForm.formState.errors.password]}
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end -mt-3">
                <button
                  type="button"
                  onClick={() => setMode("forgot-password")}
                  className="text-sm text-muted-foreground underline hover:no-underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-foreground underline hover:no-underline"
                >
                  Create one
                </button>
              </p>
            </form>
          ) : mode === "forgot-password" ? (
            <form
              onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
              className="space-y-6"
            >
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>

              <FieldGroup>
                <Field
                  data-invalid={!!forgotPasswordForm.formState.errors.email}
                >
                  <FieldLabel
                    htmlFor="forgotEmail"
                    className="text-sm font-light"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="forgotEmail"
                    type="email"
                    {...forgotPasswordForm.register("email")}
                    className="rounded-none"
                    placeholder="your@email.com"
                  />
                  <FieldError
                    errors={[forgotPasswordForm.formState.errors.email]}
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={isSendingReset}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
              >
                {isSendingReset ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-foreground underline hover:no-underline"
                >
                  Back to sign in
                </button>
              </p>
            </form>
          ) : (
            <form
              onSubmit={signupForm.handleSubmit(handleSignup)}
              className="space-y-6"
            >
              <FieldGroup>
                <Field data-invalid={!!signupForm.formState.errors.fullName}>
                  <FieldLabel
                    htmlFor="fullName"
                    className="text-sm font-light"
                  >
                    Full Name
                  </FieldLabel>
                  <Input
                    id="fullName"
                    type="text"
                    {...signupForm.register("fullName")}
                    className="rounded-none"
                    placeholder="Your name"
                  />
                  <FieldError
                    errors={[signupForm.formState.errors.fullName]}
                  />
                </Field>

                <Field data-invalid={!!signupForm.formState.errors.email}>
                  <FieldLabel
                    htmlFor="signupEmail"
                    className="text-sm font-light"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="signupEmail"
                    type="email"
                    {...signupForm.register("email")}
                    className="rounded-none"
                    placeholder="your@email.com"
                  />
                  <FieldError errors={[signupForm.formState.errors.email]} />
                </Field>

                <Field data-invalid={!!signupForm.formState.errors.password}>
                  <FieldLabel
                    htmlFor="signupPassword"
                    className="text-sm font-light"
                  >
                    Password
                  </FieldLabel>
                  <Input
                    id="signupPassword"
                    type="password"
                    {...signupForm.register("password")}
                    className="rounded-none"
                    placeholder="••••••••"
                  />
                  <FieldError
                    errors={[signupForm.formState.errors.password]}
                  />
                </Field>

                <Field
                  data-invalid={!!signupForm.formState.errors.confirmPassword}
                >
                  <FieldLabel
                    htmlFor="confirmPassword"
                    className="text-sm font-light"
                  >
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...signupForm.register("confirmPassword")}
                    className="rounded-none"
                    placeholder="••••••••"
                  />
                  <FieldError
                    errors={[signupForm.formState.errors.confirmPassword]}
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-foreground underline hover:no-underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
