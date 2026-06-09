"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Dices, Trophy, Users } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import CrewPill from "@/components/CrewPill";

interface Props {
  user?: { name?: string | null; image?: string | null } | null;
}

const TABS = [
  { href: "/", label: "Drehen", icon: Dices },
  { href: "/tabelle", label: "Tabelle", icon: Trophy },
  { href: "/crew", label: "Crew", icon: Users },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function TopNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="max-w-5xl mx-auto mb-6 sm:mb-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={28} />
          <span className="font-display font-extrabold tracking-tight text-base sm:text-xl text-fg">
            Rad der <span className="gradient-shame">Schande</span>
          </span>
        </Link>

        {/* Desktop-Tabs */}
        <nav className="hidden sm:flex items-center gap-1">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href);
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

        {/* Desktop: Crew-Pill + User + Settings */}
        <div className="hidden sm:flex items-center gap-2">
          <CrewPill />
          <Link href="/settings" className="btn-ghost" aria-label="Einstellungen">
            <Settings size={16} />
          </Link>
        </div>

        {/* Mobile: Avatar */}
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
