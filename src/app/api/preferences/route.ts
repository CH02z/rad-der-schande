import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember } from "@/lib/crew";
import UserProfile from "@/models/UserProfile";

export const dynamic = "force-dynamic";

type ProfileDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  activeCrewId: Types.ObjectId | null;
  preferences: {
    theme: "dark" | "light";
    muted: boolean;
    locale: "de" | "en";
  };
};

async function ensureProfile(userId: Types.ObjectId): Promise<ProfileDoc> {
  return (await UserProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        activeCrewId: null,
        preferences: { theme: "dark", muted: false, locale: "de" },
        createdAt: new Date(),
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, new: true }
  ).lean()) as unknown as ProfileDoc;
}

/** GET /api/preferences — Profile + Preferences. Upserts on first read. */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  await dbConnect();
  const profile = await ensureProfile(userId);

  return NextResponse.json({
    theme: profile.preferences.theme,
    muted: profile.preferences.muted,
    locale: profile.preferences.locale,
    activeCrewId: profile.activeCrewId
      ? String(profile.activeCrewId)
      : null,
  });
}

/** PUT /api/preferences — Update theme/muted/locale/activeCrewId */
export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: {
    theme?: unknown;
    muted?: unknown;
    locale?: unknown;
    activeCrewId?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await dbConnect();
  await ensureProfile(userId);

  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (body.theme === "dark" || body.theme === "light") {
    set["preferences.theme"] = body.theme;
  }
  if (typeof body.muted === "boolean") {
    set["preferences.muted"] = body.muted;
  }
  if (body.locale === "de" || body.locale === "en") {
    set["preferences.locale"] = body.locale;
  }

  // activeCrewId-Wechsel: validieren dass User auch wirklich Mitglied ist
  if (body.activeCrewId === null) {
    set["activeCrewId"] = null;
  } else if (typeof body.activeCrewId === "string") {
    if (!Types.ObjectId.isValid(body.activeCrewId)) {
      return NextResponse.json({ error: "Invalid activeCrewId" }, { status: 400 });
    }
    const cid = new Types.ObjectId(body.activeCrewId);
    if (!(await isCrewMember(cid, userId))) {
      return NextResponse.json(
        { error: "Du bist kein Mitglied dieser Crew" },
        { status: 403 }
      );
    }
    set["activeCrewId"] = cid;
  }

  const profile = (await UserProfile.findOneAndUpdate(
    { userId },
    { $set: set },
    { new: true }
  ).lean()) as unknown as ProfileDoc;

  return NextResponse.json({
    theme: profile.preferences.theme,
    muted: profile.preferences.muted,
    locale: profile.preferences.locale,
    activeCrewId: profile.activeCrewId
      ? String(profile.activeCrewId)
      : null,
  });
}
