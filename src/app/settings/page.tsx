import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LogOut, Palette, Volume2 as Vol2, User } from "lucide-react";
import { auth, signOut } from "@/auth";
import BrandMark from "@/components/BrandMark";
import { ThemeToggle, SoundToggle } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 sm:px-8">
      {/* Top-Bar */}
      <header className="max-w-2xl mx-auto flex items-center justify-between mb-8">
        <Link href="/" className="btn-ghost">
          <ArrowLeft size={16} /> Zurück
        </Link>
        <div className="flex items-center gap-2">
          <BrandMark size={24} />
          <span className="font-display font-bold tracking-tight text-fg">
            Einstellungen
          </span>
        </div>
        <div className="w-[88px]" />
      </header>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* User Card */}
        <section className="glass-strong rounded-3xl p-6 flex items-center gap-4">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface grid place-items-center">
              <User size={28} className="text-fg-mute" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-xl text-fg truncate">
              {user?.name ?? "Anonym"}
            </div>
            <div className="text-sm text-fg-mute truncate">
              {user?.email ?? "—"}
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Palette size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">Darstellung</h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            Wähle dein bevorzugtes Theme. Wird auf diesem Gerät gespeichert.
          </p>
          <ThemeToggle />
        </section>

        {/* Audio */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Vol2 size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">Sound</h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            Casino-Ticks beim Drehen und Jackpot-Fanfare beim Gewinnen.
          </p>
          <SoundToggle />
        </section>

        {/* Account */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <LogOut size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">Account</h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            Du bleibst bis zur Abmeldung eingeloggt.
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="btn-danger">
              <LogOut size={14} />
              Abmelden
            </button>
          </form>
        </section>

        <p className="text-center text-xs text-fg-faint pt-4">
          rad-der-schande.ch
        </p>
      </div>
    </main>
  );
}
