import { auth } from "@/auth";
import TopNav from "@/components/TopNav";
import CrewList from "./CrewList";

export const dynamic = "force-dynamic";

export default async function CrewListPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <TopNav user={user} />

      <section className="max-w-2xl mx-auto text-center mb-6 sm:mb-10">
        <p className="uppercase tracking-[0.32em] text-[10px] sm:text-xs text-text-gold mb-2 sm:mb-3 font-semibold">
          Hall of Crews
        </p>
        <h1 className="font-display font-black leading-[0.92] tracking-tight text-4xl sm:text-6xl text-fg">
          Deine <span className="gradient-shame">Crews</span>
        </h1>
        <p className="mt-2 sm:mt-3 text-fg-soft text-sm sm:text-base">
          Wechsle zwischen Crews oder erstelle eine neue.
        </p>
      </section>

      <section className="max-w-xl mx-auto">
        <CrewList />
      </section>
    </main>
  );
}
