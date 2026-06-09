import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import clientPromise from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/user";
import { isCrewMember, isCrewOwner, setActiveCrew } from "@/lib/crew";
import Crew from "@/models/Crew";
import CrewMember from "@/models/CrewMember";
import Spin from "@/models/Spin";
import UserProfile from "@/models/UserProfile";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

function parseId(raw: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(raw) ? new Types.ObjectId(raw) : null;
}

/** GET /api/crews/[id] — Crew-Details + Mitgliederliste */
export async function GET(_req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = parseId(id);
  if (!crewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await dbConnect();

  const member = await isCrewMember(crewId, userId);
  if (!member) return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });

  const crew = await Crew.findOne({ _id: crewId, deletedAt: null }).lean<{
    _id: Types.ObjectId;
    code: string;
    name: string;
    emoji: string;
    accentColor: string;
    ownerId: Types.ObjectId;
    createdAt: Date;
  }>();
  if (!crew) return NextResponse.json({ error: "Crew nicht gefunden" }, { status: 404 });

  const memberships = await CrewMember.find({
    crewId,
    leftAt: null,
  }).sort({ joinedAt: 1 }).lean();

  // Lade User-Infos (name, image, email) direkt aus der Auth.js users-Collection
  const client = await clientPromise;
  const usersCollection = client.db().collection("users");
  const userIds = memberships.map((m) => m.userId);
  const users = await usersCollection
    .find({ _id: { $in: userIds } })
    .project({ _id: 1, name: 1, email: 1, image: 1 })
    .toArray();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const members = memberships.map((m) => {
    const u = userMap.get(String(m.userId));
    const name = (u?.name as string | undefined) ?? null;
    const displayName =
      m.nickname ?? name ?? (u?.email as string | undefined)?.split("@")[0] ?? "Anonym";
    return {
      userId: String(m.userId),
      name,
      nickname: m.nickname ?? null,
      displayName,
      email: u?.email ?? null,
      image: u?.image ?? null,
      role: m.role,
      joinedAt: m.joinedAt,
      isYou: String(m.userId) === String(userId),
    };
  });

  return NextResponse.json({
    id: String(crew._id),
    code: crew.code,
    name: crew.name,
    emoji: crew.emoji ?? "🎰",
    accentColor: crew.accentColor ?? "#E8C36A",
    ownerId: String(crew.ownerId),
    createdAt: crew.createdAt,
    members,
    yourRole: members.find((m) => m.isYou)?.role ?? "member",
  });
}

/** PATCH /api/crews/[id] — Crew umbenennen (Owner only) */
export async function PATCH(req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = parseId(id);
  if (!crewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await dbConnect();

  if (!(await isCrewOwner(crewId, userId))) {
    return NextResponse.json({ error: "Nur der Owner darf das" }, { status: 403 });
  }

  let body: { name?: unknown; emoji?: unknown; accentColor?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { isValidEmoji, isValidColor } = await import("@/lib/avatars");
  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2 || name.length > 40) {
      return NextResponse.json(
        { error: "Name muss 2 bis 40 Zeichen lang sein" },
        { status: 400 }
      );
    }
    update.name = name;
  }
  if (typeof body.emoji === "string" && isValidEmoji(body.emoji)) {
    update.emoji = body.emoji;
  }
  if (typeof body.accentColor === "string" && isValidColor(body.accentColor)) {
    update.accentColor = body.accentColor;
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: "Nichts zu updaten" }, { status: 400 });
  }

  await Crew.updateOne({ _id: crewId }, { $set: update });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/crews/[id] — Crew auflösen (Owner only, soft delete) */
export async function DELETE(_req: Request, { params }: RouteCtx) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const crewId = parseId(id);
  if (!crewId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await dbConnect();

  if (!(await isCrewOwner(crewId, userId))) {
    return NextResponse.json({ error: "Nur der Owner darf das" }, { status: 403 });
  }

  const now = new Date();

  // Soft-delete: Crew als gelöscht markieren, alle Memberships beenden,
  // Spins bleiben für Historie (aber sind durch crewId.deletedAt nicht mehr sichtbar)
  await Promise.all([
    Crew.updateOne({ _id: crewId }, { $set: { deletedAt: now } }),
    CrewMember.updateMany(
      { crewId, leftAt: null },
      { $set: { leftAt: now } }
    ),
    // Optional: Spin-Historie behalten. Für Hard-Reset könnten wir Spin.deleteMany machen.
    // Aktuell behalten wir die Daten — sie sind via crewId-Filter ohnehin unsichtbar.
  ]);

  // Wer die Crew als aktiv hatte → auf Solo zurück
  await UserProfile.updateMany(
    { activeCrewId: crewId },
    { $set: { activeCrewId: null, updatedAt: now } }
  );

  // Optionally: Spins endgültig löschen
  await Spin.deleteMany({ crewId });

  return NextResponse.json({ ok: true });
}
