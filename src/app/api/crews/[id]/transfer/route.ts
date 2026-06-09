import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewOwner } from "@/lib/crew";
import Crew from "@/models/Crew";
import CrewMember from "@/models/CrewMember";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

/**
 * POST /api/crews/[id]/transfer — Crew-Ownership übergeben.
 * Body: { targetUserId: string }
 *
 * Atomar:
 *   1. Crew.ownerId aktualisieren
 *   2. Target → owner
 *   3. Bisheriger Owner → member
 */
export async function POST(req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  if (!crewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: { targetUserId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetIdStr = typeof body.targetUserId === "string" ? body.targetUserId : "";
  if (!Types.ObjectId.isValid(targetIdStr)) {
    return NextResponse.json({ error: "Invalid targetUserId" }, { status: 400 });
  }
  const targetId = new Types.ObjectId(targetIdStr);

  if (targetId.equals(userId)) {
    return NextResponse.json(
      { error: "Du bist bereits Owner" },
      { status: 400 }
    );
  }

  await dbConnect();

  if (!(await isCrewOwner(crewId, userId))) {
    return NextResponse.json({ error: "Nur der Owner darf das" }, { status: 403 });
  }

  const target = await CrewMember.findOne({
    crewId,
    userId: targetId,
    leftAt: null,
  });
  if (!target) {
    return NextResponse.json(
      { error: "Ziel-User ist kein aktives Mitglied" },
      { status: 404 }
    );
  }

  await Promise.all([
    Crew.updateOne(
      { _id: crewId },
      { $set: { ownerId: targetId, updatedAt: new Date() } }
    ),
    CrewMember.updateOne(
      { crewId, userId: targetId, leftAt: null },
      { $set: { role: "owner" } }
    ),
    CrewMember.updateOne(
      { crewId, userId, leftAt: null },
      { $set: { role: "member" } }
    ),
  ]);

  return NextResponse.json({ ok: true });
}
