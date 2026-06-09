import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember } from "@/lib/crew";
import { resolveDisplayNames } from "@/lib/display";
import Spin from "@/models/Spin";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

interface Participant {
  userId: Types.ObjectId | null;
  name: string;
}

interface SpinLean {
  loser: Participant;
  participants: Participant[];
  createdAt: Date;
}

/** Key der Teilnehmer-Identität: `u:<userId>` für registrierte, `g:<name>` für Gäste. */
function keyOf(p: Participant): string {
  return p.userId ? `u:${p.userId}` : `g:${p.name}`;
}

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

  // Spins chronologisch — wir machen alle Aggregationen in einem Pass.
  const spins = (await Spin.find({ crewId })
    .sort({ createdAt: 1 })
    .select("loser participants createdAt")
    .lean()) as unknown as SpinLean[];

  const totalSpins = spins.length;

  // === Eindeutige Identitäten sammeln (für Display-Name-Resolution) ===
  const identityByKey = new Map<string, Participant>();
  for (const spin of spins) {
    identityByKey.set(keyOf(spin.loser), spin.loser);
    for (const p of spin.participants) identityByKey.set(keyOf(p), p);
  }
  const userIds = Array.from(identityByKey.values())
    .map((p) => p.userId)
    .filter((u): u is Types.ObjectId => u !== null);
  const displayMap = await resolveDisplayNames(userIds, crewId);

  const displayName = (key: string): string => {
    const p = identityByKey.get(key);
    if (!p) return "Anonym";
    if (p.userId) return displayMap.get(String(p.userId)) ?? p.name;
    return p.name;
  };

  // === Streaks + Top-Loser + Last-Loser im selben Loop ===
  const streakMap = new Map<string, { current: number; max: number }>();
  const loserCounts = new Map<string, number>();
  let lastKey: string | null = null;
  let currentRun = 0;
  let topKey: string | null = null;
  let topCount = 0;

  for (const spin of spins) {
    const k = keyOf(spin.loser);

    // Streak-Logic
    if (k === lastKey) currentRun += 1;
    else currentRun = 1;
    lastKey = k;
    const s = streakMap.get(k) ?? { current: 0, max: 0 };
    s.max = Math.max(s.max, currentRun);
    streakMap.set(k, s);

    // Top-Loser
    const c = (loserCounts.get(k) ?? 0) + 1;
    loserCounts.set(k, c);
    if (c > topCount) {
      topCount = c;
      topKey = k;
    }
  }
  for (const [k, s] of streakMap) {
    s.current = k === lastKey ? currentRun : 0;
  }

  // === Rivalitäten ===
  interface RivalryInner {
    aKey: string;
    bKey: string;
    aLost: number;
    bLost: number;
    total: number;
  }
  const rivalryMap = new Map<string, RivalryInner>();
  for (const spin of spins) {
    const loserKey = keyOf(spin.loser);
    for (const other of spin.participants) {
      const otherKey = keyOf(other);
      if (otherKey === loserKey) continue;

      const [k1, k2] =
        loserKey < otherKey ? [loserKey, otherKey] : [otherKey, loserKey];
      const pairKey = `${k1}||${k2}`;
      let r = rivalryMap.get(pairKey);
      if (!r) {
        r = { aKey: k1, bKey: k2, aLost: 0, bLost: 0, total: 0 };
        rivalryMap.set(pairKey, r);
      }
      r.total += 1;
      if (loserKey === k1) r.aLost += 1;
      else r.bLost += 1;
    }
  }

  const rivalries = Array.from(rivalryMap.values())
    .sort((x, y) => y.total - x.total)
    .slice(0, 8)
    .map((r) => ({
      a: displayName(r.aKey),
      b: displayName(r.bKey),
      aLost: r.aLost,
      bLost: r.bLost,
      total: r.total,
    }));

  const streaks = Array.from(streakMap.entries())
    .map(([k, s]) => ({
      name: displayName(k),
      current: s.current,
      max: s.max,
      isOnFire: s.current >= 3,
    }))
    .sort((a, b) => b.current - a.current || b.max - a.max);

  return NextResponse.json({
    totalSpins,
    topLoser: topKey ? displayName(topKey) : null,
    topLoserCount: topCount,
    lastLoser: lastKey ? displayName(lastKey) : null,
    rivalries,
    streaks,
  });
}
