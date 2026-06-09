import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { getCurrentUserId } from "@/lib/user";
import { isCrewOwner, setActiveCrew } from "@/lib/crew";
import CrewMember from "@/models/CrewMember";
import UserProfile from "@/models/UserProfile";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

/** POST /api/crews/[id]/leave — aktive Crew verlassen */
export async function POST(_req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  if (!crewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await dbConnect();

  // Owner kann nicht einfach verlassen — muss erst Owner übergeben oder Crew löschen
  if (await isCrewOwner(crewId, userId)) {
    return NextResponse.json(
      {
        error:
          "Als Owner kannst du nicht verlassen. Übergebe die Crew oder lösche sie.",
      },
      { status: 400 }
    );
  }

  const now = new Date();
  const result = await CrewMember.updateOne(
    { crewId, userId, leftAt: null },
    { $set: { leftAt: now } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { error: "Du bist kein aktives Mitglied dieser Crew" },
      { status: 404 }
    );
  }

  // Wenn das die aktive Crew war → zurück auf Solo
  const profile = await UserProfile.findOne({ userId }).lean<{
    activeCrewId: Types.ObjectId | null;
  }>();
  if (profile?.activeCrewId && String(profile.activeCrewId) === String(crewId)) {
    await setActiveCrew(userId, null);
  }

  return NextResponse.json({ ok: true });
}
