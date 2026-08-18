import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-light text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">Oops! Page not found</p>
        <Link href="/" className="text-foreground underline hover:no-underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
