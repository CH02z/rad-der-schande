import { signIn } from "@/auth";
import LoginBody from "./LoginBody";

/** Nur interne Pfade zulassen (kein Open-Redirect). */
function safeCallback(raw?: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const redirectTo = safeCallback(callbackUrl);

  async function doSignIn() {
    "use server";
    await signIn("google", { redirectTo });
  }

  return <LoginBody signInAction={doSignIn} />;
}
