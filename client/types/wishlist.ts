import type { paths } from "@/lib/api/schema";

export type WishlistItem =
  paths["/api/v1/wishlist"]["get"]["responses"]["200"]["content"]["application/json"][number];
