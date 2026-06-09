"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Swords, Crown, Loader2, Dices } from "lucide-react";
import { useT } from "@/lib/i18n";

interface Rivalry {
  a: string;
  b: string;
  aLost: number;
  bLost: number;
  total: number;
}

interface Streak {
  name: string;
  current: number;
  max: number;
  isOnFire: boolean;
}

interface StatsData {
  totalSpins: number;
  topLoser: string | null;
  topLoserCount: number;
  lastLoser: string | null;
  rivalries: Rivalry[];
  streaks: Streak[];
}

export default function StatsPanel({ crewId }: { crewId: string }) {
  const { t } = useT();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crews/${crewId}/stats`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    void load();
    const onSpin = () => load();
    window.addEventListener("spin-logged", onSpin);
    return () => window.removeEventListener("spin-logged", onSpin);
  }, [load]);

  if (loading) {
    return (
      <div className="card-casino p-6 grid place-items-center">
        <Loader2 className="animate-spin text-fg-mute" />
      </div>
    );
  }

  if (!data || data.totalSpins === 0) {
    return (
      <div className="card-casino p-6 text-center">
        <Dices size={28} className="text-fg-mute mx-auto mb-2" />
        <p className="text-sm text-fg-mute">{t("stats.emptyText")}</p>
      </div>
    );
  }

  const onFire = data.streaks.filter((s) => s.isOnFire);
  const topRivalry = data.rivalries[0];

  return (
    <div className="space-y-3">
      {/* Top-Loser Highlight */}
      {data.topLoser && (
        <div className="card-casino p-5 sm:p-6">
          <p className="eyebrow-gold mb-2">{t("stats.halloShame")}</p>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-fg-mute mb-0.5">{t("stats.shameKing")}</div>
              <div className="font-display font-black text-2xl sm:text-3xl gradient-shame truncate">
                {data.topLoser}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-extrabold text-3xl text-fg tabular-nums">
                {data.topLoserCount}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-fg-mute">
                {t("stats.shames")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* On Fire Streaks */}
      {onFire.length > 0 && (
        <div className="card-casino p-5 sm:p-6">
          <header className="flex items-center gap-2 mb-3">
            <Flame size={15} className="text-shame" />
            <h3 className="font-display font-bold text-fg">{t("stats.onFireTitle")}</h3>
          </header>
          <ul className="space-y-2">
            {onFire.map((s) => (
              <li
                key={s.name}
                className="flex items-center gap-3 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,45,85,0.08)",
                  border: "1px solid rgba(255,45,85,0.20)",
                }}
              >
                <Flame size={18} className="text-shame shrink-0" />
                <span className="flex-1 font-medium text-fg truncate">{s.name}</span>
                <span className="text-xs text-fg-mute">
                  {s.current} {t("stats.onFireSuffix")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Rivalitäten */}
      {data.rivalries.length > 0 && (
        <div className="card-casino p-5 sm:p-6">
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Swords size={15} className="text-fg-mute" />
              <h3 className="font-display font-bold text-fg">{t("stats.rivalriesTitle")}</h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-fg-mute">
              {t("stats.headToHead")}
            </span>
          </header>

          {topRivalry && (
            <div
              className="rounded-2xl p-4 mb-3 text-center"
              style={{
                background: "var(--surface-gold)",
                border: "1px solid var(--border-gold)",
              }}
            >
              <div className="text-[10px] uppercase tracking-widest text-fg-mute mb-1.5">
                {t("stats.biggestBeef")}
              </div>
              <div className="flex items-center justify-center gap-3 text-fg">
                <span className="font-display font-bold text-base sm:text-lg truncate">
                  {topRivalry.a}
                </span>
                <span className="text-xs font-mono text-fg-mute">vs.</span>
                <span className="font-display font-bold text-base sm:text-lg truncate">
                  {topRivalry.b}
                </span>
              </div>
              <div className="mt-2 inline-flex items-center gap-3 text-xs font-mono">
                <span className="text-fg-soft tabular-nums">
                  {topRivalry.aLost}
                </span>
                <span className="text-fg-mute">:</span>
                <span className="text-fg-soft tabular-nums">
                  {topRivalry.bLost}
                </span>
                <span className="text-fg-mute">
                  · {topRivalry.total} {t("stats.spinsLabel")}
                </span>
              </div>
            </div>
          )}

          {data.rivalries.length > 1 && (
            <ul className="space-y-1.5">
              {data.rivalries.slice(1, 6).map((r, i) => (
                <RivalryRow key={`${r.a}-${r.b}-${i}`} rivalry={r} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Personal Best Streaks */}
      {data.streaks.length > 0 && (
        <div className="card-casino p-5 sm:p-6">
          <header className="flex items-center gap-2 mb-3">
            <Crown size={15} className="text-gold-bright" />
            <h3 className="font-display font-bold text-fg">{t("stats.streaksTitle")}</h3>
          </header>
          <ul className="space-y-1">
            {[...data.streaks]
              .sort((a, b) => b.max - a.max)
              .slice(0, 5)
              .map((s) => (
                <li
                  key={s.name}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl"
                >
                  <span className="text-fg-mute font-mono text-xs w-4">
                    {s.max}×
                  </span>
                  <span className="flex-1 font-medium text-fg truncate">
                    {s.name}
                  </span>
                  {s.current > 0 && (
                    <span className="text-[10px] uppercase tracking-widest text-shame">
                      {t("stats.currentPrefix")} {s.current}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RivalryRow({ rivalry: r }: { rivalry: Rivalry }) {
  const aPct = r.total > 0 ? (r.aLost / r.total) * 100 : 50;
  return (
    <motion.li
      layout
      className="px-3 py-2 rounded-xl"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between text-xs font-medium mb-1">
        <span className="text-fg truncate">{r.a}</span>
        <span className="text-fg-mute font-mono shrink-0">
          {r.aLost} : {r.bLost}
        </span>
        <span className="text-fg truncate">{r.b}</span>
      </div>
      <div className="relative h-1 rounded-full bg-fg/10 overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 bg-shame/50"
          style={{ width: `${aPct}%` }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 bg-gold/50"
          style={{ width: `${100 - aPct}%` }}
        />
      </div>
    </motion.li>
  );
}
