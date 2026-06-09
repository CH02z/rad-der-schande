"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Swords, History as HistoryIcon } from "lucide-react";
import { useCrew } from "@/lib/crew-context";
import { useT } from "@/lib/i18n";

type Row = {
  id: string;
  date: string;
  mode: "classic" | "elim";
  spunBy: string;
  loser: string;
};
type Range = "week" | "month" | "year" | "all";

export default function SpinHistory() {
  const { activeCrewId } = useCrew();
  const { t, locale } = useT();
  const RANGES: { id: Range; label: string }[] = [
    { id: "week", label: t("tabelle.ranges.week") },
    { id: "month", label: t("tabelle.ranges.month") },
    { id: "year", label: t("tabelle.ranges.year") },
    { id: "all", label: t("tabelle.ranges.all") },
  ];

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("all");

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const load = useCallback(
    async (r: Range = range) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spins/history?range=${r}`);
        if (res.ok) setRows(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [range],
  );

  useEffect(() => {
    load(range);
    const onSpin = () => load(range);
    const onCrewChange = () => load(range);
    window.addEventListener("spin-logged", onSpin);
    window.addEventListener("crew-changed", onCrewChange);
    return () => {
      window.removeEventListener("spin-logged", onSpin);
      window.removeEventListener("crew-changed", onCrewChange);
    };
  }, [load, range, activeCrewId]);

  return (
    <section className="glass-strong rounded-3xl p-6 sm:p-7">
      {/* Range Segmented Control */}
      <div className="segmented w-full mb-5 grid grid-cols-4">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            data-active={range === r.id}
            className="segmented-btn"
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-fg-mute text-sm flex flex-col items-center gap-2">
          <HistoryIcon size={22} className="text-fg-faint" />
          {t("tabelle.history.empty")}
        </div>
      ) : (
        <ol className="space-y-2">
          <AnimatePresence initial={false}>
            {rows.map((r) => {
              const Icon = r.mode === "elim" ? Swords : Target;
              return (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl px-3.5 py-2.5 flex items-center gap-3 bg-surface border border-line"
                >
                  <span
                    className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
                    style={{
                      background: "rgba(255,45,85,0.12)",
                      color: "#FF6B86",
                      border: "1px solid rgba(255,45,85,0.22)",
                    }}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug">
                      <span className="font-display font-bold text-shame">{r.loser}</span>{" "}
                      <span className="text-fg-mute">{t("tabelle.history.bears")}</span>
                    </div>
                    <div className="text-[11px] text-fg-mute truncate">
                      {t("tabelle.history.spunBy", { name: r.spunBy })} · {fmt.format(new Date(r.date))}
                    </div>
                  </div>
                  <span
                    className="hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shrink-0"
                    style={{
                      background: "var(--surface-gold)",
                      color: "var(--text-gold)",
                      border: "1px solid var(--border-gold)",
                    }}
                  >
                    {t(r.mode === "elim" ? "wheel.modes.elim" : "wheel.modes.classic")}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}
