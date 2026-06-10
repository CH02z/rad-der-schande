import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TopNav from "@/components/TopNav";
import JoinClient from "./JoinClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  const session = await auth();
  const user = session?.user;

  // Ausgeloggt → erst einloggen, danach automatisch zurück zum Join-Link,
  // damit der Beitritt tatsächlich erfolgt (Join-Absicht überlebt den Login).
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/join/${code}`)}`);
  }

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />
      <JoinClient code={code.toUpperCase()} />
    </main>
  );
}
