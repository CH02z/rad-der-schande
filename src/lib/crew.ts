import { Types } from "mongoose";
import Crew from "@/models/Crew";
import CrewMember from "@/models/CrewMember";
import UserProfile from "@/models/UserProfile";

// 31 Zeichen — keine ambiguen 0/O/1/I/L. 31^6 = ~887 Mio Kombinationen.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 8;

/**
 * Generiert einen eindeutigen Crew-Code (z.B. „X7K9P2").
 * Re-tried bei Kollisionen — extrem unwahrscheinlich, aber sicher.
 */
export async function generateUniqueCrewCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    const existing = await Crew.exists({ code });
    if (!existing) return code;
  }
  throw new Error("Code-Generation fehlgeschlagen nach " + MAX_ATTEMPTS + " Versuchen");
}

/** Liefert die Crews in denen der User aktiv ist (mit Rolle + Member-Count). */
export async function getMyCrews(userId: Types.ObjectId) {
  const memberships = await CrewMember.find({
    userId,
    leftAt: null,
  }).lean();

  if (memberships.length === 0) return [];

  const crewIds = memberships.map((m) => m.crewId);
  const crews = await Crew.find({
    _id: { $in: crewIds },
    deletedAt: null,
  }).lean();

  const counts = await CrewMember.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { crewId: { $in: crewIds }, leftAt: null } },
    { $group: { _id: "$crewId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const roleMap = new Map(memberships.map((m) => [String(m.crewId), m.role]));

  return crews.map((c) => ({
    id: String(c._id),
    code: c.code,
    name: c.name,
    ownerId: String(c.ownerId),
    role: roleMap.get(String(c._id)) ?? "member",
    memberCount: countMap.get(String(c._id)) ?? 0,
    createdAt: c.createdAt,
  }));
}

/** Prüft ob User aktives Mitglied einer Crew ist. */
export async function isCrewMember(
  crewId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<boolean> {
  const m = await CrewMember.exists({ crewId, userId, leftAt: null });
  return !!m;
}

/** Prüft ob User der Owner einer Crew ist. */
export async function isCrewOwner(
  crewId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<boolean> {
  const crew = await Crew.findOne({ _id: crewId, deletedAt: null }).lean<{ ownerId: Types.ObjectId }>();
  return crew?.ownerId?.equals(userId) ?? false;
}

/** Setzt die aktive Crew im UserProfile (null = Solo). */
export async function setActiveCrew(
  userId: Types.ObjectId,
  crewId: Types.ObjectId | null
) {
  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: { activeCrewId: crewId, updatedAt: new Date() },
      $setOnInsert: {
        userId,
        preferences: { theme: "dark", muted: false, locale: "de" },
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}
