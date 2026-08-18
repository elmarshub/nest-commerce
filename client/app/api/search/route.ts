import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/api/products";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ data: [] });
  }

  const results = await getProducts({ search: q, limit: 8 });
  return NextResponse.json({ data: results.data });
}
