"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-light text-foreground">
          Something went wrong
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          We couldn&apos;t load this page. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="text-foreground underline hover:no-underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
