"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Palette,
  Volume2 as Vol2,
  Globe,
  Bell,
  User,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import VersionTag from "@/components/VersionTag";
import { ThemeToggle, SoundToggle, LocaleSelector, PushToggle } from "./SettingsClient";
import { useT } from "@/lib/i18n";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  signOutAction: () => Promise<void>;
}

export default function SettingsBody({ user, signOutAction }: Props) {
  const { t } = useT();

  return (
    <main className="min-h-screen px-4 pt-5 pb-32 sm:px-8 sm:pt-6 sm:pb-12">
      <header className="max-w-2xl mx-auto flex items-center justify-between mb-6 sm:mb-8">
        <Link href="/" className="btn-ghost">
          <ArrowLeft size={16} /> {t("nav.back")}
        </Link>
        <div className="flex items-center gap-2">
          <BrandMark size={24} />
          <span className="font-display font-bold tracking-tight text-fg">
            {t("settings.title")}
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
              {user?.name ?? t("common.anon")}
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
            <h3 className="font-display font-bold text-fg">
              {t("settings.appearance")}
            </h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            {t("settings.appearanceHint")}
          </p>
          <ThemeToggle />
        </section>

        {/* Sound */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Vol2 size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">
              {t("settings.sound")}
            </h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">{t("settings.soundHint")}</p>
          <SoundToggle />
        </section>

        {/* Push */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">
              {t("settings.push")}
            </h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            {t("settings.pushHint")}
          </p>
          <PushToggle />
        </section>

        {/* Language */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">
              {t("settings.language")}
            </h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            {t("settings.languageHint")}
          </p>
          <LocaleSelector />
        </section>

        {/* Account */}
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <LogOut size={16} className="text-fg-mute" />
            <h3 className="font-display font-bold text-fg">
              {t("settings.account")}
            </h3>
          </div>
          <p className="text-sm text-fg-soft mb-4">
            {t("settings.accountHint")}
          </p>
          <form action={signOutAction}>
            <button type="submit" className="btn-danger">
              <LogOut size={14} />
              {t("settings.signOut")}
            </button>
          </form>
        </section>

        <p className="flex items-center justify-center gap-2 text-center text-xs text-fg-faint pt-4">
          rad-der-schande.ch
          <span aria-hidden>·</span>
          <VersionTag />
        </p>
      </div>
    </main>
  );
}
