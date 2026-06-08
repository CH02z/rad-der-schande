import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import SpinResult from "@/models/SpinResult";

export const dynamic = "force-dynamic";

// Ein Spin-Ergebnis speichern (der Verlierer bekommt einen Schande-Punkt)
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

// Schande-Tabelle: wer wie oft verloren hat
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  await dbConnect();
  const board = await SpinResult.aggregate([
    { $group: { _id: "$loser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return NextResponse.json(
    board.map((b: { _id: string; count: number }) => ({ name: b._id, count: b.count }))
  );
}
