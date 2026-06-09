import { Types } from "mongoose";
import clientPromise from "@/lib/mongodb";
import CrewMember from "@/models/CrewMember";

/**
 * Auflösung des Display-Namens eines Users in einer Crew.
 *
 * Reihenfolge:
 *  1. crewMember.nickname (wenn gesetzt) — vom Owner vergeben
 *  2. user.name (Google-Profil)
 *  3. email-Prefix
 *  4. "Anonym"
 *
 * Ohne crewId fallen wir direkt auf 2./3./4. zurück.
 */
export async function resolveDisplayNames(
  userIds: Types.ObjectId[],
  crewId: Types.ObjectId | null
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (userIds.length === 0) return result;

  const dedup = Array.from(new Map(userIds.map((u) => [String(u), u])).values());

  // 1) Nicknames aus crewMembers (auch von ehemaligen Mitgliedern, damit
  //    historische Spins ihren Spitznamen behalten).
  //    Wenn ein User mehrere Memberships hat (left + rejoined), nimm die
  //    neueste mit gesetztem Nickname.
  const nicknameMap = new Map<string, string>();
  if (crewId) {
    const aggregated = await CrewMember.aggregate<{
      _id: Types.ObjectId;
      nickname: string;
    }>([
      {
        $match: {
          crewId,
          userId: { $in: dedup },
          nickname: { $ne: null },
        },
      },
      { $sort: { joinedAt: -1 } },
      {
        $group: {
          _id: "$userId",
          nickname: { $first: "$nickname" },
        },
      },
    ]);
    for (const m of aggregated) {
      nicknameMap.set(String(m._id), m.nickname);
    }
  }

  // 2) users.name / email aus der Auth.js-Collection (über den raw Driver)
  const client = await clientPromise;
  const users = await client
    .db()
    .collection("users")
    .find({ _id: { $in: dedup } })
    .project({ _id: 1, name: 1, email: 1 })
    .toArray();
  const userMap = new Map(
    users.map((u) => [String(u._id), { name: u.name as string | undefined, email: u.email as string | undefined }])
  );

  for (const u of dedup) {
    const k = String(u);
    const nick = nicknameMap.get(k);
    if (nick) {
      result.set(k, nick);
      continue;
    }
    const info = userMap.get(k);
    if (info?.name) {
      result.set(k, info.name);
    } else if (info?.email) {
      result.set(k, info.email.split("@")[0]);
    } else {
      result.set(k, "Anonym");
    }
  }

  return result;
}
