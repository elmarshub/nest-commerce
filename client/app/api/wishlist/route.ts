import { NextResponse } from "next/server";
import { getMyWishlist } from "@/lib/api/wishlist";

export async function GET() {
  try {
    const items = await getMyWishlist();
    return NextResponse.json({ data: items ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to load wishlist" },
      { status: 502 },
    );
  }
}
