import { NextResponse } from "next/server";
import type { PipelineStage } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import SpinResult from "@/models/SpinResult";

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

// POST: ein Spin-Ergebnis loggen
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await req.json();
  if (!body?.loser) {
    return NextResponse.json({ error: "loser fehlt" }, { status: 400 });
  }

  await dbConnect();
  const doc = await SpinResult.create({
    loser: body.loser,
    participants: Array.isArray(body.participants) ? body.participants : [],
    spunBy: session.user.email ?? session.user.name,
  });

  return NextResponse.json(doc, { status: 201 });
}

// GET: Schande-Tabelle (optional gefiltert auf Zeitraum)
//   ?range=week|month|year|all   (default = all)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "all") as Range;
  const start = rangeStart(range);

  await dbConnect();

  const pipeline: PipelineStage[] = [];
  if (start) {
    pipeline.push({ $match: { createdAt: { $gte: start } } });
  }
  pipeline.push(
    { $group: { _id: "$loser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  );

  const board = await SpinResult.aggregate(pipeline);

  return NextResponse.json(
    board.map((b: { _id: string; count: number }) => ({ name: b._id, count: b.count })),
  );
}

// DELETE: gesamte Schande-Tabelle leeren (irreversibel)
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  await dbConnect();
  const res = await SpinResult.deleteMany({});

  return NextResponse.json({ deleted: res.deletedCount ?? 0 });
}
