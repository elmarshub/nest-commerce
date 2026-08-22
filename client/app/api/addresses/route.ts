import { NextResponse } from "next/server";
import { getMyAddresses } from "@/lib/api/addresses";

export async function GET() {
  const addresses = await getMyAddresses();
  return NextResponse.json({ data: addresses ?? [] });
}
