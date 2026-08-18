import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="relative flex items-center">
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-light hidden sm:inline">
                Continue Shopping
              </span>
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <Link
              href="/"
              className="text-xl font-light tracking-widest text-foreground"
            >
              HAVEN
            </Link>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="text-sm font-light text-foreground">Support</div>
          </div>
        </div>
      </div>
    </header>
  );
}
