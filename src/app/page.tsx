import Image from "next/image";
import { auth, signOut } from "@/auth";
import Wheel from "@/components/Wheel";
import Leaderboard from "@/components/Leaderboard";
import BrandMark from "@/components/BrandMark";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 sm:px-8">
      {/* Top-Bar */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-10 sm:mb-14">
        <div className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="font-display font-extrabold tracking-tight text-lg sm:text-xl">
            Rad der <span className="gradient-shame">Schande</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 glass rounded-full pl-1 pr-4 py-1">
            {user?.image && (
              <Image
                src={user.image}
                alt={user.name ?? ""}
                width={30}
                height={30}
                className="rounded-full"
              />
            )}
            <span className="text-sm font-medium text-white/80">
              {user?.name ?? "Anonym"}
            </span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="btn-ghost">
              Abmelden
            </button>
          </form>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-white/40 mb-3">
          Drama in 5 Sekunden
        </p>
        <h1 className="font-display font-black leading-[0.92] tracking-tight text-5xl sm:text-7xl">
          Wer <span className="gradient-shame">zahlt</span>
          <span className="text-white/30">?</span>
        </h1>
        <p className="mt-4 text-white/55 text-base sm:text-lg max-w-md mx-auto">
          Namen rein, Rad drehen, Konsequenzen tragen. Die Schande-Tabelle vergisst nichts.
        </p>
      </section>

      {/* Wheel */}
      <section className="max-w-3xl mx-auto">
        <Wheel />
      </section>

      {/* Leaderboard */}
      <section className="max-w-md mx-auto mt-16 sm:mt-24">
        <Leaderboard />
      </section>

      <footer className="max-w-3xl mx-auto mt-20 text-center text-xs text-white/30">
        <span>rad-der-schande.ch · gebaut mit </span>
        <span className="text-shame">♥</span>
        <span> für die 5er-Gang</span>
      </footer>
    </main>
  );
}
