"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased">
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-light text-black">
              Something went wrong
            </h1>
            <p className="mb-6 text-lg text-gray-500">
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="rounded-lg border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
