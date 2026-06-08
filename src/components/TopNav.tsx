"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Dices, Trophy } from "lucide-react";
import BrandMark from "@/components/BrandMark";

interface Props {
  user?: { name?: string | null; image?: string | null } | null;
}

const TABS = [
  { href: "/", label: "Drehen", icon: Dices },
  { href: "/tabelle", label: "Tabelle", icon: Trophy },
];

export default function TopNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="max-w-5xl mx-auto mb-6 sm:mb-10">
      <div className="flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={28} />
          <span className="font-display font-extrabold tracking-tight text-base sm:text-xl text-fg">
            Rad der <span className="gradient-shame">Schande</span>
          </span>
        </Link>

        {/* Tab-Pills (Desktop only) */}
        <nav className="hidden sm:flex items-center gap-1">
          {TABS.map((t) => {
            const active = pathname === t.href;
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                data-active={active}
                className="tab-pill"
              >
                <Icon size={15} />
                {t.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Settings (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
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

        {/* Mobile: kleines Avatar-Bild rechts (ohne Settings — das ist in der Bottom-Nav) */}
        {user?.image && (
          <div className="sm:hidden">
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={32}
              height={32}
              className="rounded-full border border-fg/10"
            />
          </div>
        )}
      </div>
    </header>
  );
}
