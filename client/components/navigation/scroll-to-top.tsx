"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Next's default Link scroll behavior only resets scroll if it can find a
// visible, scrollable element to anchor to after navigation. Pages that
// stream in content via Suspense render very short initially (just the
// header), so if you navigate while scrolled far down a previous page,
// that heuristic finds nothing in view and leaves scroll position
// untouched — landing you past the new page's (still short) content.
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams.toString() is the stable identity to key off
  }, [pathname, searchParams.toString()]);

  return null;
}
