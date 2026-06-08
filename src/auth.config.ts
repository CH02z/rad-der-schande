import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-sicherer Teil: keine DB-Imports hier (läuft auch in der Middleware).
// AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET werden automatisch aus den Env-Vars gelesen.
export default {
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
