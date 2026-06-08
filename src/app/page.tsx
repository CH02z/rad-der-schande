import { auth } from "@/auth";
import Wheel from "@/components/Wheel";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />
      <Wheel />
    </main>
  );
}
