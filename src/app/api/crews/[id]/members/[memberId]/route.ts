import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewOwner } from "@/lib/crew";
import CrewMember from "@/models/CrewMember";
import UserProfile from "@/models/UserProfile";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string; memberId: string }> };

/** PATCH /api/crews/[id]/members/[memberId] — Owner setzt Nickname */
export async function PATCH(req: Request, { params }: RouteCtx) {
  const { id, memberId } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  const targetId = Types.ObjectId.isValid(memberId)
    ? new Types.ObjectId(memberId)
    : null;
  if (!crewId || !targetId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();
  if (!(await isCrewOwner(crewId, userId))) {
    return NextResponse.json(
      { error: "Nur der Owner darf Spitznamen vergeben" },
      { status: 403 }
    );
  }

  let body: { nickname?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let nickname: string | null;
  if (body.nickname === null || body.nickname === "") {
    nickname = null;
  } else if (typeof body.nickname === "string") {
    const trimmed = body.nickname.trim();
    if (trimmed.length === 0) {
      nickname = null;
    } else if (trimmed.length > 30) {
      return NextResponse.json(
        { error: "Spitzname zu lang (max 30 Zeichen)" },
        { status: 400 }
      );
    } else {
      nickname = trimmed;
    }
  } else {
    return NextResponse.json({ error: "nickname fehlt" }, { status: 400 });
  }

  const res = await CrewMember.updateOne(
    { crewId, userId: targetId, leftAt: null },
    { $set: { nickname } }
  );
  if (res.matchedCount === 0) {
    return NextResponse.json({ error: "Mitglied nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, nickname });
}

/** DELETE /api/crews/[id]/members/[memberId] — Mitglied kicken (Owner only) */
export async function DELETE(_req: Request, { params }: RouteCtx) {
  const { id, memberId } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  const targetId = Types.ObjectId.isValid(memberId)
    ? new Types.ObjectId(memberId)
    : null;
  if (!crewId || !targetId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();

  if (!(await isCrewOwner(crewId, userId))) {
    return NextResponse.json({ error: "Nur der Owner darf kicken" }, { status: 403 });
  }

  // Owner kann sich nicht selbst kicken
  if (targetId.equals(userId)) {
    return NextResponse.json(
      { error: "Du kannst dich nicht selbst kicken — lösche die Crew stattdessen" },
      { status: 400 }
    );
  }

  const now = new Date();
  const result = await CrewMember.updateOne(
    { crewId, userId: targetId, leftAt: null },
    { $set: { leftAt: now } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { error: "Mitglied nicht gefunden" },
      { status: 404 }
    );
  }

  // Falls der gekickte User die Crew aktiv hatte → auf Solo zurück
  await UserProfile.updateMany(
    { userId: targetId, activeCrewId: crewId },
    { $set: { activeCrewId: null, updatedAt: now } }
  );

  return NextResponse.json({ ok: true });
}
