import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { setActiveCrew } from "@/lib/crew";
import Crew from "@/models/Crew";
import CrewMember from "@/models/CrewMember";

export const dynamic = "force-dynamic";

/** POST /api/crews/join — Crew via Code beitreten */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code =
    typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (code.length !== 6) {
    return NextResponse.json(
      { error: "Code muss genau 6 Zeichen lang sein" },
      { status: 400 }
    );
  }

  await dbConnect();

  const crew = await Crew.findOne({ code, deletedAt: null });
  if (!crew) {
    return NextResponse.json(
      { error: "Crew nicht gefunden" },
      { status: 404 }
    );
  }

  // Bereits Mitglied?
  const existing = await CrewMember.findOne({
    crewId: crew._id,
    userId,
    leftAt: null,
  });

  if (!existing) {
    // Wenn früher mal Mitglied (leftAt gesetzt), legen wir neuen Eintrag an
    await CrewMember.create({
      crewId: crew._id,
      userId,
      role: "member",
    });
  }

  await setActiveCrew(userId, crew._id);

  const memberCount = await CrewMember.countDocuments({
    crewId: crew._id,
    leftAt: null,
  });

  return NextResponse.json({
    id: String(crew._id),
    code: crew.code,
    name: crew.name,
    ownerId: String(crew.ownerId),
    role: existing?.role ?? "member",
    memberCount,
    createdAt: crew.createdAt,
  });
}
