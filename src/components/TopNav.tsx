"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Disc3, Trophy } from "lucide-react";
import BrandMark from "@/components/BrandMark";

interface Props {
  user?: { name?: string | null; image?: string | null } | null;
}

const TABS = [
  { href: "/", label: "Drehen", icon: Disc3 },
  { href: "/tabelle", label: "Tabelle", icon: Trophy },
];

export default function TopNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="max-w-5xl mx-auto mb-8 sm:mb-10">
      <div className="flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={30} />
          <span className="hidden sm:inline font-display font-extrabold tracking-tight text-lg sm:text-xl text-fg">
            Rad der <span className="gradient-shame">Schande</span>
          </span>
        </Link>

        {/* Tabs (Mitte auf Desktop, eigene Zeile auf Mobile siehe unten) */}
        <nav className="hidden sm:flex segmented">
          {TABS.map((t) => {
            const active = pathname === t.href;
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                data-active={active}
                className="segmented-btn inline-flex items-center gap-1.5 py-1.5 px-3.5"
              >
                <Icon size={14} />
                {t.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Settings */}
        <div className="flex items-center gap-2">
          {user?.image && (
            <div className="hidden md:flex items-center gap-2.5 glass rounded-full pl-1 pr-4 py-1">
              <Image
                src={user.image}
                alt={user.name ?? ""}
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-sm font-medium text-fg-soft truncate max-w-[140px]">
                {user.name ?? "Anonym"}
              </span>
            </div>
          )}
          <Link href="/settings" className="btn-ghost" aria-label="Einstellungen">
            <Settings size={16} />
          </Link>
        </div>
      </div>

      {/* Mobile-Tabs (volle Breite, eigene Zeile) */}
      <nav className="sm:hidden mt-4 segmented grid grid-cols-2">
        {TABS.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              data-active={active}
              className="segmented-btn inline-flex items-center justify-center gap-1.5 py-2"
            >
              <Icon size={14} />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
