import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import PushSubscription from "@/models/PushSubscription";

export const dynamic = "force-dynamic";

interface Body {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
  userAgent?: unknown;
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";
  const userAgent =
    typeof body.userAgent === "string" ? body.userAgent.slice(0, 200) : null;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Subscription incomplete" },
      { status: 400 }
    );
  }

  await dbConnect();
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      $set: {
        userId,
        endpoint,
        keys: { p256dh, auth },
        userAgent,
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
