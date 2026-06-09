import { signIn } from "@/auth";
import LoginBody from "./LoginBody";

async function doSignIn() {
  "use server";
  await signIn("google", { redirectTo: "/" });
}

export default function LoginPage() {
  return <LoginBody signInAction={doSignIn} />;
}
