"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, Check, Plus, KeyRound, Settings as Gear } from "lucide-react";
import { useCrew } from "@/lib/crew-context";

/**
 * Pill im TopNav (Desktop): zeigt aktive Crew (oder Solo) + Dropdown
 * zum Wechseln. Auf Mobile via BottomNav-Tab erreichbar.
 */
export default function CrewPill() {
  const { crews, activeCrewId, activeCrew, setActiveCrewId, loading } = useCrew();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (loading) {
    return (
      <div
        className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold animate-pulse"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <span className="w-4 h-4 rounded-full bg-fg-mute/30" />
        <span className="w-20 h-3 rounded bg-fg-mute/30" />
      </div>
    );
  }

  const label = activeCrew?.name ?? "Solo";

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all"
        style={{
          background: activeCrew ? "var(--surface-gold)" : "var(--surface)",
          color: activeCrew ? "var(--text-gold)" : "var(--text-soft)",
          border: `1px solid ${activeCrew ? "var(--border-gold)" : "var(--border)"}`,
        }}
      >
        {activeCrew ? (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--text-gold)",
              boxShadow: "0 0 8px var(--text-gold)",
            }}
          />
        ) : (
          <User size={13} strokeWidth={2.4} />
        )}
        <span className="max-w-[160px] truncate">{label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.4}
          className={"transition " + (open ? "rotate-180" : "")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl overflow-hidden z-50"
            style={{
              background: "var(--surface-strong)",
              border: "1px solid var(--border-strong)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="p-2">
              {/* Solo-Option */}
              <button
                onClick={async () => {
                  await setActiveCrewId(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-fg/5 text-left transition"
              >
                <div
                  className="grid place-items-center w-8 h-8 rounded-lg"
                  style={{ background: "var(--surface)", color: "var(--text-soft)" }}
                >
                  <User size={15} />
                </div>
                <span className="flex-1 text-fg">Solo</span>
                {activeCrewId === null && (
                  <Check size={16} className="text-gold-bright" strokeWidth={2.6} />
                )}
              </button>

              {crews.length > 0 && (
                <div className="my-1.5 h-px bg-fg/8" />
              )}

              {/* Crew-Liste */}
              {crews.map((c) => {
                const active = c.id === activeCrewId;
                return (
                  <button
                    key={c.id}
                    onClick={async () => {
                      await setActiveCrewId(c.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-fg/5 text-left transition"
                  >
                    <div
                      className="grid place-items-center w-8 h-8 rounded-lg text-xs font-bold"
                      style={{
                        background: "var(--surface-gold)",
                        color: "var(--text-gold)",
                      }}
                    >
                      {c.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-fg truncate">{c.name}</div>
                      <div className="text-[11px] text-fg-mute">
                        {c.memberCount} {c.memberCount === 1 ? "Mitglied" : "Mitglieder"}
                        {c.role === "owner" && " · Owner"}
                      </div>
                    </div>
                    {active && (
                      <Check size={16} className="text-gold-bright" strokeWidth={2.6} />
                    )}
                  </button>
                );
              })}

              <div className="my-1.5 h-px bg-fg/8" />

              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/crew?create=1");
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-fg/5 text-left transition text-fg-soft"
              >
                <div
                  className="grid place-items-center w-8 h-8 rounded-lg"
                  style={{ background: "var(--surface)" }}
                >
                  <Plus size={15} strokeWidth={2.4} />
                </div>
                Neue Crew erstellen
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/crew?join=1");
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-fg/5 text-left transition text-fg-soft"
              >
                <div
                  className="grid place-items-center w-8 h-8 rounded-lg"
                  style={{ background: "var(--surface)" }}
                >
                  <KeyRound size={15} strokeWidth={2.4} />
                </div>
                Mit Code beitreten
              </button>
              <Link
                href="/crew"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-fg/5 text-left transition text-fg-mute"
              >
                <div
                  className="grid place-items-center w-8 h-8 rounded-lg"
                  style={{ background: "var(--surface)" }}
                >
                  <Gear size={14} strokeWidth={2.4} />
                </div>
                Crews verwalten
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
