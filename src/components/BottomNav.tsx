"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dices, Trophy, Users, Menu } from "lucide-react";
import { useT } from "@/lib/i18n";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav({ authed = false }: { authed?: boolean }) {
  const pathname = usePathname();
  const { t } = useT();

  // Nur für eingeloggte User. Ausgeloggt (Landing, Legal, Login) → keine Navbar.
  if (!authed) return null;
  if (pathname === "/login") return null;

  const ITEMS = [
    { href: "/", label: t("nav.spin"), icon: Dices },
    { href: "/tabelle", label: t("nav.tabelle"), icon: Trophy },
    { href: "/crew", label: t("nav.crew"), icon: Users },
    { href: "/settings", label: t("nav.more"), icon: Menu },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="relative mx-3 mb-3 rounded-3xl border overflow-hidden"
        style={{
          background: "color-mix(in srgb, var(--bg) 70%, transparent)",
          borderColor: "var(--border-strong)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div
          aria-hidden
          className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(232,195,106,0.6), transparent)",
          }}
        />

        <ul className="flex">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 select-none"
                  style={{ minHeight: 56 }}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(232,195,106,0.18), rgba(232,195,106,0.06))",
                        boxShadow: "inset 0 0 0 1px rgba(232,195,106,0.35)",
                      }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 1.9}
                    className={
                      "relative z-10 transition-colors " +
                      (active ? "text-gold-bright" : "text-fg-mute")
                    }
                  />
                  <span
                    className={
                      "relative z-10 text-[10px] font-bold tracking-wide transition-colors " +
                      (active ? "text-fg" : "text-fg-mute")
                    }
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
