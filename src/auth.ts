import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { Types } from "mongoose";
import clientPromise from "@/lib/mongodb";
import { dbConnect } from "@/lib/mongoose";
import UserProfile from "@/models/UserProfile";
import authConfig from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  events: {
    /**
     * Bei jedem OAuth-Sign-In: stelle sicher, dass der User ein UserProfile
     * mit Default-Preferences hat. Idempotent via $setOnInsert — wird nicht
     * überschrieben falls bereits vorhanden.
     */
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        await dbConnect();
        await UserProfile.findOneAndUpdate(
          { userId: new Types.ObjectId(user.id) },
          {
            $setOnInsert: {
              userId: new Types.ObjectId(user.id),
              activeCrewId: null,
              preferences: { theme: "dark", muted: false, locale: "de" },
              createdAt: new Date(),
            },
            $set: { updatedAt: new Date() },
          },
          { upsert: true }
        );
      } catch (e) {
        console.error("[auth.signIn] profile init failed:", e);
      }
    },
  },
  ...authConfig,
});
