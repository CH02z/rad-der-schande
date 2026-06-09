import { auth, signOut } from "@/auth";
import SettingsBody from "./SettingsBody";

export const dynamic = "force-dynamic";

async function doSignOut() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function SettingsPage() {
  const session = await auth();
  return <SettingsBody user={session?.user ?? null} signOutAction={doSignOut} />;
}
