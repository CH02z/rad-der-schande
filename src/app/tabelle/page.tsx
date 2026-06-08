import { auth } from "@/auth";
import Leaderboard from "@/components/Leaderboard";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function TabellePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 sm:px-8">
      <TopNav user={user} />

      <section className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
        <p className="uppercase tracking-[0.32em] text-xs text-fg-mute mb-3">
          Hall of Shame
        </p>
        <h1 className="font-display font-black leading-[0.92] tracking-tight text-4xl sm:text-6xl text-fg">
          Schande-<span className="gradient-shame">Tabelle</span>
        </h1>
        <p className="mt-3 text-fg-soft text-base">
          Wer wie oft den Kürzeren gezogen hat.
        </p>
      </section>

      <section className="max-w-md mx-auto">
        <Leaderboard />
      </section>

      <footer className="max-w-3xl mx-auto mt-20 text-center text-xs text-fg-faint">
        <span>rad-der-schande.ch · gebaut mit </span>
        <span className="text-shame">♥</span>
        <span> für die 5er-Gang</span>
      </footer>
    </main>
  );
}
