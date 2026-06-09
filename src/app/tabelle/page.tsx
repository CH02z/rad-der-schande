import { auth } from "@/auth";
import Leaderboard from "@/components/Leaderboard";
import TopNav from "@/components/TopNav";
import TabelleHero from "./TabelleHero";

export const dynamic = "force-dynamic";

export default async function TabellePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />
      <TabelleHero />
      <section className="max-w-md mx-auto">
        <Leaderboard />
      </section>
    </main>
  );
}
