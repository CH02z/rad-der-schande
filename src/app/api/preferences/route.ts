import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import UserPreference from "@/models/UserPreference";

export const dynamic = "force-dynamic";

type PreferenceDoc = {
  email: string;
  theme: "dark" | "light";
  muted: boolean;
  updatedAt: Date;
};

// GET: Präferenzen für eingeloggten User laden (oder Defaults)
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  await dbConnect();
  const pref = await UserPreference.findOne<PreferenceDoc>({
    email: session.user.email,
  }).lean();

  return NextResponse.json({
    theme: pref?.theme ?? "dark",
    muted: pref?.muted ?? false,
  });
}

// PUT: Präferenzen updaten (upsert). Nur theme + muted erlaubt.
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: { theme?: unknown; muted?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Partial<PreferenceDoc> = { updatedAt: new Date() };
  if (body.theme === "dark" || body.theme === "light") update.theme = body.theme;
  if (typeof body.muted === "boolean") update.muted = body.muted;

  await dbConnect();
  const pref = (await UserPreference.findOneAndUpdate(
    { email: session.user.email },
    { $set: { email: session.user.email, ...update } },
    { upsert: true, new: true }
  ).lean()) as PreferenceDoc | null;

  return NextResponse.json({
    theme: pref?.theme ?? "dark",
    muted: pref?.muted ?? false,
  });
}
