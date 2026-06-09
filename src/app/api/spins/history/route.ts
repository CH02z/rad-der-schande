import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember } from "@/lib/crew";
import { resolveDisplayNames } from "@/lib/display";
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

/**
 * GET /api/spins/history?range=week|month|year|all
 * Chronologische Liste der Spins im aktiven Scope (Crew oder Solo).
 * Liefert pro Spin: Datum, Modus, wer gedreht hat, wen die Schande traf.
 */
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "all") as Range;
  const start = rangeStart(range);
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit") ?? 60)),
  );

  await dbConnect();
  const { crewId, isSolo } = await resolveScope(userId);

  const match: Record<string, unknown> = isSolo
    ? { crewId: null, spunByUserId: userId }
    : { crewId };
  if (start) match.createdAt = { $gte: start };

  const spins = await Spin.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("createdAt mode spunByUserId loser")
    .lean<
      {
        _id: Types.ObjectId;
        createdAt: Date;
        mode: "classic" | "elim";
        spunByUserId: Types.ObjectId;
        loser: { userId: Types.ObjectId | null; name: string };
      }[]
    >();

  // Alle beteiligten User-IDs (Dreher + Verlierer) einsammeln und Namen auflösen
  const ids: Types.ObjectId[] = [];
  for (const s of spins) {
    if (s.spunByUserId) ids.push(s.spunByUserId);
    if (s.loser?.userId) ids.push(s.loser.userId);
  }
  const displayMap = await resolveDisplayNames(ids, crewId);

  const rows = spins.map((s) => ({
    id: String(s._id),
    date: s.createdAt instanceof Date ? s.createdAt.toISOString() : new Date(s.createdAt).toISOString(),
    mode: s.mode,
    spunBy: displayMap.get(String(s.spunByUserId)) ?? "—",
    loser: s.loser?.userId
      ? displayMap.get(String(s.loser.userId)) ?? s.loser.name
      : s.loser?.name ?? "—",
  }));

  return NextResponse.json(rows);
}
