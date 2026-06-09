import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { generateUniqueCrewCode, getMyCrews, setActiveCrew } from "@/lib/crew";
import Crew from "@/models/Crew";
import CrewMember from "@/models/CrewMember";

export const dynamic = "force-dynamic";

/** GET /api/crews — Liste aller Crews in denen ich aktiv bin */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  await dbConnect();
  const crews = await getMyCrews(userId);
  return NextResponse.json(crews);
}

/** POST /api/crews — Neue Crew erstellen */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 40) {
    return NextResponse.json(
      { error: "Name muss 2 bis 40 Zeichen lang sein" },
      { status: 400 }
    );
  }

  await dbConnect();
  const code = await generateUniqueCrewCode();
  const crew = await Crew.create({
    code,
    name,
    ownerId: userId,
  });
  await CrewMember.create({
    crewId: crew._id,
    userId,
    role: "owner",
  });
  // Automatisch zur neuen Crew wechseln
  await setActiveCrew(userId, crew._id);

  return NextResponse.json(
    {
      id: String(crew._id),
      code: crew.code,
      name: crew.name,
      ownerId: String(crew.ownerId),
      role: "owner",
      memberCount: 1,
      createdAt: crew.createdAt,
    },
    { status: 201 }
  );
}
