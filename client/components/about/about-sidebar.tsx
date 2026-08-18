"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const aboutPages = [
  { name: "Our Story", path: "/about/our-story" },
  { name: "Sustainability", path: "/about/sustainability" },
  { name: "Size Guide", path: "/about/size-guide" },
  { name: "Customer Care", path: "/about/customer-care" },
  { name: "Store Locator", path: "/about/store-locator" },
];

export function AboutSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-64 sticky top-32 h-fit px-6">
      <nav className="space-y-1">
        <h3 className="text-lg font-light text-foreground mb-6">About</h3>
        {aboutPages.map((page) => {
          const isActive = pathname === page.path;

          return (
            <Link
              key={page.path}
              href={page.path}
              className={`block py-2 text-sm font-light transition-all ${
                isActive
                  ? "text-primary underline decoration-2 underline-offset-4"
                  : "text-muted-foreground hover:text-foreground hover:underline hover:decoration-1 hover:underline-offset-4"
              }`}
            >
              {page.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
