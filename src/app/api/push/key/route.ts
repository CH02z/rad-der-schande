import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/push/key — liefert den VAPID-Public-Key für die Client-Subscription. */
export async function GET() {
  return NextResponse.json({
    key: process.env.VAPID_PUBLIC_KEY ?? "",
  });
}
