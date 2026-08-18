"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function pageHref(pathname: string, searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", page.toString());
  return `${pathname}?${params.toString()}`;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "...", totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }

  return (
    <section className="w-full px-6 py-8">
      <div className="flex justify-start items-center gap-2">
        <Button
          asChild={currentPage !== 1}
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30 -ml-2"
          disabled={currentPage === 1}
        >
          {currentPage === 1 ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <Link href={pageHref(pathname, searchParams, currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={`${page}-${index}`}
                asChild
                variant="ghost"
                size="sm"
                className={`min-w-8 h-8 hover:bg-transparent hover:underline text-sm ${
                  page === currentPage ? "underline font-normal" : "font-light"
                }`}
              >
                <Link href={pageHref(pathname, searchParams, page)}>{page}</Link>
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="mx-2 text-sm font-light text-muted-foreground">
                {page}
              </span>
            ),
          )}
        </div>

        <Button
          asChild={currentPage !== totalPages}
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30"
          disabled={currentPage === totalPages}
        >
          {currentPage === totalPages ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <Link href={pageHref(pathname, searchParams, currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      </div>
    </section>
  );
}
