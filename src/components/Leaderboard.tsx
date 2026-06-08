"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame } from "lucide-react";

type Row = { name: string; count: number };

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/spins");
      if (res.ok) setRows(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onSpin = () => load();
    window.addEventListener("spin-logged", onSpin);
    return () => window.removeEventListener("spin-logged", onSpin);
  }, [load]);

  const max = rows[0]?.count ?? 1;

  return (
    <section className="glass-strong rounded-3xl p-6 sm:p-7">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-gold" />
          <h2 className="font-display font-bold text-lg tracking-tight">Schande-Tabelle</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.18em] text-white/35">
          Alltime
        </span>
      </header>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-white/40 text-sm">
          Noch keine Schande in der Datenbank. Dreh das Rad.
        </div>
      ) : (
        <ol className="space-y-2">
          <AnimatePresence initial={false}>
            {rows.map((r, i) => {
              const pct = (r.count / max) * 100;
              const isTop = i === 0;
              return (
                <motion.li
                  key={r.name}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className={
                    "relative overflow-hidden rounded-2xl px-4 py-3 flex items-center justify-between " +
                    (isTop
                      ? "bg-gradient-to-r from-shame/15 to-transparent border border-shame/25"
                      : "bg-white/[0.03] border border-white/[0.06]")
                  }
                >
                  {/* Hintergrund-Balken */}
                  <div
                    className="absolute inset-y-0 left-0 -z-10 rounded-2xl"
                    style={{
                      width: `${pct}%`,
                      background: isTop
                        ? "linear-gradient(90deg, rgba(255,45,85,0.18), transparent 70%)"
                        : "linear-gradient(90deg, rgba(255,255,255,0.04), transparent 70%)",
                    }}
                  />

                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-7 h-7 text-base">
                      {MEDAL[i] ?? (
                        <span className="text-white/40 font-mono text-sm">
                          {i + 1}
                        </span>
                      )}
                    </span>
                    <span className={"font-medium " + (isTop ? "text-white" : "text-white/85")}>
                      {r.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isTop && <Flame size={14} className="text-shame" />}
                    <span
                      className={
                        "font-display font-bold tabular-nums " +
                        (isTop ? "text-shame text-lg" : "text-white/60 text-base")
                      }
                    >
                      {r.count}×
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}
