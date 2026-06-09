import { NextResponse } from "next/server";
import { Types, type PipelineStage } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember, isCrewOwner } from "@/lib/crew";
import { resolveDisplayNames } from "@/lib/display";
import { sendPushToUsers } from "@/lib/push";
import Spin from "@/models/Spin";
import UserProfile from "@/models/UserProfile";
import CrewMember from "@/models/CrewMember";
import Crew from "@/models/Crew";

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

/** Normalisiert beide Eingabe-Formate (string oder {userId, name}) auf das structured Format. */
type RawParticipant = string | { userId?: string | null; name?: unknown };
function normalizeParticipant(
  raw: RawParticipant
): { userId: Types.ObjectId | null; name: string } | null {
  if (typeof raw === "string") {
    const n = raw.trim();
    return n ? { userId: null, name: n.slice(0, 30) } : null;
  }
  if (typeof raw === "object" && raw !== null) {
    const name =
      typeof raw.name === "string" ? raw.name.trim().slice(0, 30) : "";
    if (!name) return null;
    let uid: Types.ObjectId | null = null;
    if (raw.userId && typeof raw.userId === "string" && Types.ObjectId.isValid(raw.userId)) {
      uid = new Types.ObjectId(raw.userId);
    }
    return { userId: uid, name };
  }
  return null;
}

/** POST /api/spins — neues Ergebnis loggen */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  let body: {
    loser?: RawParticipant;
    participants?: RawParticipant[];
    mode?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const loser = body.loser ? normalizeParticipant(body.loser) : null;
  if (!loser) {
    return NextResponse.json({ error: "loser fehlt oder invalid" }, { status: 400 });
  }
  const participants = Array.isArray(body.participants)
    ? (body.participants
        .map(normalizeParticipant)
        .filter(Boolean) as { userId: Types.ObjectId | null; name: string }[])
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

  // Push-Notifications an alle anderen aktiven Crew-Mitglieder (fire-and-forget)
  if (crewId) {
    void notifyCrewSpin({
      crewId,
      spunByUserId: userId,
      loserName: loser.name,
    });
  }

  return NextResponse.json(
    { id: String(doc._id), crewId: crewId ? String(crewId) : null },
    { status: 201 }
  );
}

async function notifyCrewSpin({
  crewId,
  spunByUserId,
  loserName,
}: {
  crewId: Types.ObjectId;
  spunByUserId: Types.ObjectId;
  loserName: string;
}) {
  try {
    const [others, crew, spunByName] = await Promise.all([
      CrewMember.find({
        crewId,
        userId: { $ne: spunByUserId },
        leftAt: null,
      })
        .select("userId")
        .lean<{ userId: Types.ObjectId }[]>(),
      Crew.findById(crewId).lean<{ name: string; emoji?: string }>(),
      resolveDisplayNames([spunByUserId], crewId).then((m) =>
        m.get(String(spunByUserId)) ?? "Jemand"
      ),
    ]);

    if (others.length === 0 || !crew) return;
    const userIds = others.map((o) => o.userId);
    const emoji = crew.emoji ?? "🎰";
    await sendPushToUsers(userIds, {
      title: `${emoji} ${crew.name}`,
      body: `${spunByName} hat gedreht — ${loserName} trägt die Schande.`,
      url: "/tabelle",
      tag: `crew-${String(crewId)}`,
    });
  } catch (err) {
    console.error("[notifyCrewSpin]", err);
  }
}

/**
 * GET /api/spins?range=week|month|year|all
 * Aggregiert nach userId (Crew-Member) oder Name (Gast).
 * Display-Namen resolved via lib/display.
 */
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

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
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $ne: ["$loser.userId", null] },
            { $concat: ["u:", { $toString: "$loser.userId" }] },
            { $concat: ["g:", "$loser.name"] },
          ],
        },
        userId: { $first: "$loser.userId" },
        snapshotName: { $first: "$loser.name" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];

  const grouped = await Spin.aggregate<{
    _id: string;
    userId: Types.ObjectId | null;
    snapshotName: string;
    count: number;
  }>(pipeline);

  // User-ObjectIds einsammeln und Anzeige-Namen auflösen
  const userIds = grouped
    .map((g) => g.userId)
    .filter((u): u is Types.ObjectId => u !== null);
  const displayMap = await resolveDisplayNames(userIds, crewId);

  const rows = grouped.map((g) => {
    const name =
      g.userId !== null
        ? displayMap.get(String(g.userId)) ?? g.snapshotName
        : g.snapshotName;
    return {
      userId: g.userId ? String(g.userId) : null,
      name,
      count: g.count,
    };
  });

  return NextResponse.json(rows);
}

/**
 * DELETE /api/spins — Tabelle leeren.
 * Solo: nur eigene Solo-Spins.
 * Crew: nur Owner.
 */
export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

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
