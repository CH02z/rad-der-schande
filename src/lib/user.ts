import { Types } from "mongoose";
import { auth } from "@/auth";

/**
 * Liefert die aktuelle User-ObjectId aus der Session.
 * Returns null wenn nicht angemeldet oder JWT keine sub-Claim enthält.
 */
export async function getCurrentUserId(): Promise<Types.ObjectId | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
