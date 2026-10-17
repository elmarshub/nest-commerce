"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthModalStore } from "@/lib/stores/auth-modal-store";
import { verifyEmail } from "@/lib/auth/actions";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This verification link is invalid or missing.",
  );
  // tokens are single-use, so guard against React Strict Mode's double effect
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    verifyEmail(token).then(({ error }) => {
      if (error) {
        setMessage(error);
        setStatus("error");
      } else {
        setStatus("success");
      }
    });
  }, [token]);

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto mb-6 h-8 w-8 animate-spin text-muted-foreground" />
            <h1 className="text-xl font-light text-foreground mb-2">
              Verifying your email…
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-6 h-10 w-10 text-foreground" />
            <h1 className="text-xl font-light text-foreground mb-2">
              Email verified
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Your account is active. You can sign in and start shopping.
            </p>
            <Button
              className="rounded-none"
              onClick={() => {
                router.push("/");
                openAuthModal("login");
              }}
            >
              Sign in
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-6 h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-light text-foreground mb-2">
              Couldn&apos;t verify your email
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              {message} Sign in to request a new verification email.
            </p>
            <Button asChild className="rounded-none">
              <Link href="/">Back to home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
