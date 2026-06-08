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

      <section className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
        <p className="uppercase tracking-[0.32em] text-[10px] sm:text-xs text-gold/80 mb-2 sm:mb-3 font-semibold">
          Eine Runde · ein Loser · ewige Schande
        </p>
        <h1 className="font-display font-black leading-[0.92] tracking-tight text-4xl sm:text-7xl text-fg">
          Wer wird zur <span className="gradient-shame">Schande</span>
          <span className="text-fg-faint">?</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-fg-soft text-sm sm:text-lg max-w-md mx-auto">
          Namen rein, Rad drehen, Konsequenzen tragen.
        </p>
      </section>

      <section className="max-w-3xl mx-auto">
        <Wheel />
      </section>
    </main>
  );
}
