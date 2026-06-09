import { NextResponse } from "next/server";
import { Types, type PipelineStage } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember, isCrewOwner } from "@/lib/crew";
import Spin from "@/models/Spin";
import UserProfile from "@/models/UserProfile";

export const dynamic = "force-dynamic";

type Range = "week" | "month" | "year" | "all";

function rangeStart(range: Range): Date | null {
  const now = new Date();
  switch (range) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "all":
    default:
      return null;
  }
}

/**
 * Liefert den scope-filter für die nachfolgenden Queries.
 * Solo-Mode: nur eigene Spins ohne crewId.
 * Crew-Mode: alle Spins der aktiven Crew.
 */
async function resolveScope(userId: Types.ObjectId) {
  const profile = await UserProfile.findOne({ userId }).lean<{
    activeCrewId: Types.ObjectId | null;
  }>();
  const activeCrewId = profile?.activeCrewId ?? null;
  if (activeCrewId && (await isCrewMember(activeCrewId, userId))) {
    return { crewId: activeCrewId, isSolo: false } as const;
  }
  return { crewId: null, isSolo: true } as const;
}

/** POST /api/spins — neues Ergebnis loggen */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: {
    loser?: unknown;
    participants?: unknown;
    mode?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const loser = typeof body.loser === "string" ? body.loser.trim() : "";
  if (!loser || loser.length > 30) {
    return NextResponse.json({ error: "loser fehlt oder zu lang" }, { status: 400 });
  }
  const participants = Array.isArray(body.participants)
    ? body.participants.filter((p): p is string => typeof p === "string")
    : [];
  const mode = body.mode === "elim" ? "elim" : "classic";

  await dbConnect();
  const { crewId } = await resolveScope(userId);

  const doc = await Spin.create({
    crewId,
    spunByUserId: userId,
    loser,
    participants,
    mode,
  });

  return NextResponse.json(
    { id: String(doc._id), crewId: crewId ? String(crewId) : null },
    { status: 201 }
  );
}

/**
 * GET /api/spins?range=week|month|year|all
 *
 * Solo-User: aggregiert eigene Solo-Spins.
 * Crew-User: aggregiert alle Spins der aktiven Crew.
 */
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "all") as Range;
  const start = rangeStart(range);

  await dbConnect();
  const { crewId, isSolo } = await resolveScope(userId);

  const match: Record<string, unknown> = isSolo
    ? { crewId: null, spunByUserId: userId }
    : { crewId };
  if (start) match.createdAt = { $gte: start };

  const pipeline: PipelineStage[] = [
    { $match: match },
    { $group: { _id: "$loser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const board = await Spin.aggregate(pipeline);

  return NextResponse.json(
    board.map((b: { _id: string; count: number }) => ({
      name: b._id,
      count: b.count,
    }))
  );
}

/**
 * DELETE /api/spins — Schande-Tabelle leeren.
 * Solo: nur eigene Solo-Spins.
 * Crew: nur der Owner darf die Crew-Tabelle leeren.
 */
export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  await dbConnect();
  const { crewId, isSolo } = await resolveScope(userId);

  if (isSolo) {
    const res = await Spin.deleteMany({ crewId: null, spunByUserId: userId });
    return NextResponse.json({ deleted: res.deletedCount ?? 0 });
  }

  if (!crewId || !(await isCrewOwner(crewId, userId))) {
    return NextResponse.json(
      { error: "Nur der Crew-Owner darf die Tabelle leeren" },
      { status: 403 }
    );
  }

  const res = await Spin.deleteMany({ crewId });
  return NextResponse.json({ deleted: res.deletedCount ?? 0 });
}
