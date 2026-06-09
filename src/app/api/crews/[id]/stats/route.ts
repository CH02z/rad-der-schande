import { NextResponse } from "next/server";
import { Types, type PipelineStage } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember } from "@/lib/crew";
import Spin from "@/models/Spin";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

interface Rivalry {
  a: string;
  b: string;
  aLost: number;
  bLost: number;
  total: number;
}

interface Streak {
  name: string;
  current: number;
  max: number;
  isOnFire: boolean;
}

/**
 * GET /api/crews/[id]/stats
 *
 * Liefert für die Crew:
 *   - rivalries: top 8 Paarungen mit „wer hat wie oft gegen wen verloren"
 *   - streaks:   aktuelle + max Verlustserie pro Spieler
 *   - topLoser:  Person mit den meisten Schande-Punkten gesamt
 *   - totalSpins
 *   - lastLoser: zuletzt verloren
 */
export async function GET(_req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  if (!crewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await dbConnect();
  if (!(await isCrewMember(crewId, userId))) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  // === Rivalitäten via Aggregation ===
  const rivalryPipeline: PipelineStage[] = [
    { $match: { crewId } },
    { $match: { $expr: { $gte: [{ $size: "$participants" }, 2] } } },
    {
      $project: {
        loser: 1,
        others: { $setDifference: ["$participants", ["$loser"]] },
      },
    },
    { $unwind: "$others" },
    {
      $project: {
        loser: 1,
        pairA: {
          $cond: [{ $lt: ["$loser", "$others"] }, "$loser", "$others"],
        },
        pairB: {
          $cond: [{ $lt: ["$loser", "$others"] }, "$others", "$loser"],
        },
        aLost: { $cond: [{ $lt: ["$loser", "$others"] }, 1, 0] },
        bLost: { $cond: [{ $lt: ["$loser", "$others"] }, 0, 1] },
      },
    },
    {
      $group: {
        _id: { a: "$pairA", b: "$pairB" },
        total: { $sum: 1 },
        aLost: { $sum: "$aLost" },
        bLost: { $sum: "$bLost" },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ];

  // === Top-Loser ===
  const topLoserPipeline: PipelineStage[] = [
    { $match: { crewId } },
    { $group: { _id: "$loser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ];

  // === Sortierte Spins für Streak-Berechnung ===
  const sortedSpinsP = Spin.find({ crewId })
    .sort({ createdAt: 1 })
    .select("loser createdAt")
    .lean<{ loser: string; createdAt: Date }[]>();

  const totalP = Spin.countDocuments({ crewId });

  const [rivalryAgg, topLoserAgg, sortedSpins, totalSpins] = await Promise.all([
    Spin.aggregate<{
      _id: { a: string; b: string };
      total: number;
      aLost: number;
      bLost: number;
    }>(rivalryPipeline),
    Spin.aggregate<{ _id: string; count: number }>(topLoserPipeline),
    sortedSpinsP,
    totalP,
  ]);

  const rivalries: Rivalry[] = rivalryAgg.map((r) => ({
    a: r._id.a,
    b: r._id.b,
    aLost: r.aLost,
    bLost: r.bLost,
    total: r.total,
  }));

  // === Streaks: chronologisch durchlaufen ===
  const streakMap = new Map<string, { current: number; max: number }>();
  let lastLoser: string | null = null;
  let currentRun = 0;
  for (const spin of sortedSpins) {
    if (spin.loser === lastLoser) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }
    lastLoser = spin.loser;

    const s = streakMap.get(spin.loser) ?? { current: 0, max: 0 };
    s.max = Math.max(s.max, currentRun);
    streakMap.set(spin.loser, s);
  }
  for (const [name, s] of streakMap) {
    s.current = name === lastLoser ? currentRun : 0;
  }

  const streaks: Streak[] = Array.from(streakMap.entries())
    .map(([name, s]) => ({
      name,
      current: s.current,
      max: s.max,
      isOnFire: s.current >= 3,
    }))
    .sort((a, b) => b.current - a.current || b.max - a.max);

  return NextResponse.json({
    totalSpins,
    topLoser: topLoserAgg[0]?._id ?? null,
    topLoserCount: topLoserAgg[0]?.count ?? 0,
    lastLoser,
    rivalries,
    streaks,
  });
}
