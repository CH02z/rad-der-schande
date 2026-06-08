"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dices, Trophy, Menu } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Drehen", icon: Dices },
  { href: "/tabelle", label: "Tabelle", icon: Trophy },
  { href: "/settings", label: "Mehr", icon: Menu },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Auf der Login-Page kein Nav
  if (pathname === "/login") return null;

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Backdrop-Blur Bar */}
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
        {/* Gold-Trim oben */}
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
            const active = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 select-none"
                  style={{ minHeight: 56 }}
                >
                  {/* Aktiver Pill-Background */}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 top-1.5 bottom-1.5 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(232,195,106,0.18), rgba(232,195,106,0.06))",
                        boxShadow: "inset 0 0 0 1px rgba(232,195,106,0.35)",
                      }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.9}
                    className={
                      "relative z-10 transition-colors " +
                      (active ? "text-gold-bright" : "text-fg-mute")
                    }
                  />
                  <span
                    className={
                      "relative z-10 text-[10.5px] font-bold tracking-wide transition-colors " +
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
