import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { dbConnect } from "@/lib/mongoose";
import UserPreference from "@/models/UserPreference";
import authConfig from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  events: {
    // Wird bei jedem OAuth-Sign-In gefeuert. Erstellt einen Default-Preferences-
    // Eintrag (idempotent) und stellt sicher, dass das User-Record-Setup
    // des Adapters durchläuft — sonst tauchen weder users/accounts noch
    // spieler-einstellungen in MongoDB auf, wenn der JWT-Cookie noch valid ist.
    async signIn({ user }) {
      if (!user?.email) return;
      try {
        await dbConnect();
        await UserPreference.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              email: user.email,
              theme: "dark",
              muted: false,
            },
          },
          { upsert: true }
        );
      } catch (e) {
        console.error("[auth.signIn] preference init failed:", e);
      }
    },
  },
  ...authConfig,
});
