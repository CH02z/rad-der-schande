import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-sicherer Teil der Auth-Konfiguration — wird auch in der Middleware
 * importiert. Keine DB-Imports hier.
 *
 * AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET werden automatisch aus Env-Vars gelesen.
 */
export default {
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    // JWT enthält `sub` = users._id (vom Adapter beim ersten Sign-In gesetzt).
    // Wir reichen das an die Session weiter, damit serverseitig immer
    // session.user.id verfügbar ist (statt email als Pseudo-Schlüssel).
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
