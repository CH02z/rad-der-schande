import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import { auth } from "@/auth";
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
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark size={30} />
          <span className="font-display font-extrabold tracking-tight text-lg sm:text-xl text-fg">
            Rad der <span className="gradient-shame">Schande</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
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
            <span className="text-sm font-medium text-fg-soft">
              {user?.name ?? "Anonym"}
            </span>
          </div>
          <Link href="/settings" className="btn-ghost" aria-label="Einstellungen">
            <Settings size={16} />
            <span className="hidden sm:inline">Einstellungen</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-fg-mute mb-3">
          Drama in 5 Sekunden
        </p>
        <h1 className="font-display font-black leading-[0.92] tracking-tight text-5xl sm:text-7xl text-fg">
          Wer <span className="gradient-shame">zahlt</span>
          <span className="text-fg-faint">?</span>
        </h1>
        <p className="mt-4 text-fg-soft text-base sm:text-lg max-w-md mx-auto">
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

      <footer className="max-w-3xl mx-auto mt-20 text-center text-xs text-fg-faint">
        <span>rad-der-schande.ch · gebaut mit </span>
        <span className="text-shame">♥</span>
        <span> für die 5er-Gang</span>
      </footer>
    </main>
  );
}
