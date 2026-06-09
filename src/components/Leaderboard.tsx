"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trash2, AlertTriangle, Dices, Crown, User as UserIcon } from "lucide-react";
import { useCrew } from "@/lib/crew-context";
import { useT } from "@/lib/i18n";

type Row = { name: string; count: number };
type Range = "week" | "month" | "year" | "all";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { activeCrew, activeCrewId } = useCrew();
  const { t } = useT();
  const RANGES: { id: Range; label: string }[] = [
    { id: "week", label: t("tabelle.ranges.week") },
    { id: "month", label: t("tabelle.ranges.month") },
    { id: "year", label: t("tabelle.ranges.year") },
    { id: "all", label: t("tabelle.ranges.all") },
  ];
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = activeCrew?.role === "owner";
  const isSolo = activeCrewId === null;
  // Solo-User dürfen ihre Tabelle leeren, Crew nur der Owner
  const canDelete = isSolo || isOwner;

  const load = useCallback(
    async (r: Range = range) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spins?range=${r}`);
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

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/spins", { method: "DELETE" });
      if (res.ok) {
        setRows([]);
        setConfirmOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  const max = rows[0]?.count ?? 1;
  const totalSpins = useMemo(() => rows.reduce((acc, r) => acc + r.count, 0), [rows]);
  const losers = rows.length;

  return (
    <>
      {/* Crew-Context-Badge */}
      <div className="mb-4 flex justify-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          style={{
            background: isSolo ? "var(--surface)" : "var(--surface-gold)",
            color: isSolo ? "var(--text-soft)" : "var(--text-gold)",
            border: `1px solid ${isSolo ? "var(--border)" : "var(--border-gold)"}`,
          }}
        >
          {isSolo ? (
            <>
              <UserIcon size={12} strokeWidth={2.4} />
              <span>{t("tabelle.soloLabel")}</span>
            </>
          ) : (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--text-gold)",
                  boxShadow: "0 0 8px var(--text-gold)",
                }}
              />
              <span>{activeCrew?.name}</span>
              {isOwner && <Crown size={11} strokeWidth={2.4} />}
            </>
          )}
        </div>
      </div>

      <section className="glass-strong rounded-3xl p-6 sm:p-7">
        {/* Stats Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-2">
            <Dices size={18} className="text-fg-mute self-center" />
            <span className="font-display font-black text-3xl text-fg tabular-nums">
              {totalSpins}
            </span>
            <span className="text-fg-mute text-sm">
              {totalSpins === 1 ? t("tabelle.spinLabel") : t("tabelle.spinsLabel")}
            </span>
          </div>
          {losers > 0 && (
            <div className="text-right">
              <div className="text-fg-mute text-xs uppercase tracking-wider">
                {t("tabelle.losersLabel")}
              </div>
              <div className="font-display font-bold text-lg text-fg tabular-nums">
                {losers}
              </div>
            </div>
          )}
        </div>

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
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-10 text-fg-mute text-sm">
            {range === "all" ? t("tabelle.emptyAll") : t("tabelle.emptyRange")}
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
                        : "bg-surface border border-line")
                    }
                  >
                    <div
                      className="absolute inset-y-0 left-0 -z-10 rounded-2xl"
                      style={{
                        width: `${pct}%`,
                        background: isTop
                          ? "linear-gradient(90deg, rgba(255,45,85,0.18), transparent 70%)"
                          : "linear-gradient(90deg, rgba(127,127,127,0.08), transparent 70%)",
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-7 h-7 text-base">
                        {MEDAL[i] ?? (
                          <span className="text-fg-mute font-mono text-sm">{i + 1}</span>
                        )}
                      </span>
                      <span className={"font-medium " + (isTop ? "text-fg" : "text-fg-soft")}>
                        {r.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isTop && <Flame size={14} className="text-shame" />}
                      <span
                        className={
                          "font-display font-bold tabular-nums " +
                          (isTop ? "text-shame text-lg" : "text-fg-soft text-base")
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

        {rows.length > 0 && canDelete && (
          <div className="mt-5 pt-4 border-t border-line flex justify-end">
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-mute hover:text-shame transition"
            >
              <Trash2 size={13} />
              {t("tabelle.clear")}
              {!isSolo && <span className="text-fg-faint">{t("tabelle.ownerOnly")}</span>}
            </button>
          </div>
        )}
      </section>

      {/* Confirm-Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
            onClick={() => !deleting && setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-7 max-w-sm w-full text-center"
            >
              <div className="grid place-items-center w-14 h-14 mx-auto mb-3 rounded-full"
                   style={{ background: "rgba(255,45,85,0.12)", border: "1px solid rgba(255,45,85,0.3)" }}>
                <AlertTriangle size={24} className="text-shame" />
              </div>
              <h3 className="font-display font-bold text-2xl text-fg mb-1">
                {t("tabelle.confirmTitle")}
              </h3>
              <p className="text-sm text-fg-soft mb-6">{t("tabelle.confirmText")}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                  className="btn-ghost flex-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(180deg, #FF4A6E 0%, #B30032 100%)",
                    boxShadow: "0 8px 24px -6px rgba(255,45,85,0.5)",
                  }}
                >
                  {deleting ? t("tabelle.deleting") : t("tabelle.deleteFinal")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
