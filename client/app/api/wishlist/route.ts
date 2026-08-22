import { NextResponse } from "next/server";
import { getMyWishlist } from "@/lib/api/wishlist";

export async function GET() {
  const items = await getMyWishlist();
  return NextResponse.json({ data: items ?? [] });
}
