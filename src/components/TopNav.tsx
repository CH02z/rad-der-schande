"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Dices, Trophy, Users } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import CrewPill from "@/components/CrewPill";
import { useT } from "@/lib/i18n";

interface Props {
  user?: { name?: string | null; image?: string | null } | null;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function TopNav({ user }: Props) {
  const pathname = usePathname();
  const { t } = useT();

  const TABS = [
    { href: "/", label: t("nav.spin"), icon: Dices },
    { href: "/tabelle", label: t("nav.tabelle"), icon: Trophy },
    { href: "/crew", label: t("nav.crew"), icon: Users },
  ];

  return (
    <header className="max-w-5xl mx-auto mb-6 sm:mb-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0">
            <BrandMark size={28} />
          </span>
          <span className="font-display font-extrabold tracking-tight text-base sm:text-xl text-fg truncate">
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

        {/* Crew-Switcher (immer sichtbar — zeigt Solo/Crew) + Settings (Desktop) */}
        <div className="flex items-center gap-2 shrink-0">
          <CrewPill userImage={user?.image} userName={user?.name} />
          <Link
            href="/settings"
            className="btn-ghost hidden sm:inline-flex"
            aria-label={t("nav.settings")}
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
