"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Users,
  ArrowRight,
  Plus,
  KeyRound,
  User as UserIcon,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useCrew, type CrewSummary } from "@/lib/crew-context";
import CrewAvatar from "@/components/CrewAvatar";
import { useT } from "@/lib/i18n";

export default function CrewList() {
  const { crews, activeCrewId, setActiveCrewId, loading, refresh } = useCrew();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();

  // Querstrings ?create=1 oder ?join=1 öffnen direkt das jeweilige Inline-Form
  const [createOpen, setCreateOpen] = useState(searchParams.get("create") === "1");
  const [joinOpen, setJoinOpen] = useState(searchParams.get("join") === "1");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);

  // Beim Mount: zu offener Section scrollen
  useEffect(() => {
    if (createOpen) createRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (joinOpen) joinRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [createOpen, joinOpen]);

  async function handleCreate() {
    if (name.trim().length < 2) {
      setError("Name muss mindestens 2 Zeichen lang sein");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Fehler" }));
        setError(error || "Fehler beim Erstellen");
        return;
      }
      const crew = (await res.json()) as CrewSummary;
      await refresh();
      router.push(`/crew/${crew.id}`);
    } catch {
      setError("Netzwerk-Fehler");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    const norm = code.trim().toUpperCase();
    if (norm.length !== 6) {
      setError("Code muss genau 6 Zeichen lang sein");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/crews/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: norm }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Fehler" }));
        setError(error || "Fehler beim Beitreten");
        return;
      }
      const crew = (await res.json()) as CrewSummary;
      await refresh();
      router.push(`/crew/${crew.id}`);
    } catch {
      setError("Netzwerk-Fehler");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  const hasNoCrews = crews.length === 0;

  return (
    <div className="space-y-5">
      {/* Active Status */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
        style={{
          background: activeCrewId ? "var(--surface-gold)" : "var(--surface)",
          color: activeCrewId ? "var(--text-gold)" : "var(--text-soft)",
          border: `1px solid ${activeCrewId ? "var(--border-gold)" : "var(--border)"}`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: activeCrewId ? "var(--text-gold)" : "var(--text-mute)",
            boxShadow: activeCrewId ? "0 0 8px var(--text-gold)" : "none",
          }}
        />
        {t("crew.list.currentLabel")}{" "}{crews.find((c) => c.id === activeCrewId)?.name ?? t("crew.list.solo")}
      </div>

      {/* Empty State */}
      {hasNoCrews && (
        <div className="card-casino p-7 sm:p-8 text-center">
          <div
            className="mx-auto grid place-items-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--surface-gold)", color: "var(--text-gold)" }}
          >
            <Users size={28} strokeWidth={2.2} />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-fg mb-2">
            {t("crew.list.emptyTitle")}
          </h2>
          <p className="text-fg-soft text-sm mb-6 max-w-sm mx-auto">
            {t("crew.list.emptyText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                setCreateOpen(true);
                setJoinOpen(false);
              }}
              className="btn-primary text-sm py-3 px-5"
            >
              <Plus size={16} strokeWidth={2.6} /> {t("crew.list.createCta")}
            </button>
            <button
              onClick={() => {
                setJoinOpen(true);
                setCreateOpen(false);
              }}
              className="btn-ghost text-sm py-3 px-5"
            >
              <KeyRound size={15} strokeWidth={2.4} /> {t("crew.list.joinCta")}
            </button>
          </div>
        </div>
      )}

      {/* Solo-Karte (sichtbar wenn andere Crews da sind, damit User wieder zu Solo wechseln kann) */}
      {!hasNoCrews && (
        <button
          onClick={() => setActiveCrewId(null)}
          className="w-full card-casino p-4 flex items-center gap-3 transition-all"
          style={{
            opacity: activeCrewId === null ? 1 : 0.6,
            borderColor: activeCrewId === null ? "var(--border-gold)" : undefined,
            boxShadow: activeCrewId === null ? "var(--shadow-gold)" : undefined,
          }}
        >
          <div
            className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: "var(--surface)", color: "var(--text-soft)" }}
          >
            <UserIcon size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-display font-bold text-fg">{t("crew.list.soloCardTitle")}</div>
            <div className="text-xs text-fg-mute">{t("crew.list.soloCardText")}</div>
          </div>
          {activeCrewId === null && (
            <Check size={18} className="text-gold-bright" strokeWidth={2.6} />
          )}
        </button>
      )}

      {/* Crews-Liste */}
      {crews.length > 0 && (
        <div className="space-y-2.5">
          {crews.map((c) => {
            const active = c.id === activeCrewId;
            const isOwner = c.role === "owner";
            return (
              <div
                key={c.id}
                className="card-casino p-4 flex items-center gap-3 transition-all"
                style={{
                  borderColor: active ? "var(--border-gold)" : undefined,
                  boxShadow: active ? "var(--shadow-gold)" : undefined,
                }}
              >
                <CrewAvatar emoji={c.emoji} color={c.accentColor} size={44} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-display font-bold text-fg truncate">{c.name}</span>
                    {isOwner && (
                      <Crown
                        size={13}
                        className="text-gold-bright shrink-0"
                        strokeWidth={2.4}
                      />
                    )}
                  </div>
                  <div className="text-xs text-fg-mute flex items-center gap-2">
                    <span className="font-mono">{c.code}</span>
                    <span>·</span>
                    <span>
                      {c.memberCount} {c.memberCount === 1 ? t("crew.list.membersOne") : t("crew.list.membersMany")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {!active && (
                    <button
                      onClick={() => setActiveCrewId(c.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl text-fg-soft hover:text-fg transition"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      {t("crew.list.activate")}
                    </button>
                  )}
                  <Link
                    href={`/crew/${c.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl inline-flex items-center justify-center gap-1"
                    style={{
                      background: "var(--surface-gold)",
                      color: "var(--text-gold)",
                      border: "1px solid var(--border-gold)",
                    }}
                  >
                    {t("crew.list.open")} <ArrowRight size={11} strokeWidth={2.6} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions: Erstellen + Beitreten */}
      {!hasNoCrews && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => {
              setCreateOpen((o) => !o);
              setJoinOpen(false);
              setError(null);
            }}
            className="btn-ghost py-3"
          >
            <Plus size={15} strokeWidth={2.4} />
            {t("crew.list.newCrew")}
          </button>
          <button
            onClick={() => {
              setJoinOpen((o) => !o);
              setCreateOpen(false);
              setError(null);
            }}
            className="btn-ghost py-3"
          >
            <KeyRound size={15} strokeWidth={2.4} />
            {t("crew.list.joinShort")}
          </button>
        </div>
      )}

      {/* Create-Form */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            ref={createRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="card-casino p-5 sm:p-6 mt-1">
              <header className="mb-4">
                <p className="eyebrow-gold">{t("crew.list.createSectionEyebrow")}</p>
                <h3 className="font-display font-bold text-lg text-fg mt-1">
                  {t("crew.list.createSectionTitle")}
                </h3>
                <p className="text-xs text-fg-mute mt-1">
                  {t("crew.list.createSectionText")}
                </p>
              </header>
              <div className="flex flex-col gap-2.5">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder={t("crew.list.createPlaceholder")}
                  maxLength={40}
                  disabled={busy}
                  className="field"
                />
                <button
                  onClick={handleCreate}
                  disabled={busy || name.trim().length < 2}
                  className="btn-primary py-3"
                >
                  {busy ? t("crew.list.creating") : t("crew.list.create")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join-Form */}
      <AnimatePresence>
        {joinOpen && (
          <motion.div
            ref={joinRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="card-casino p-5 sm:p-6 mt-1">
              <header className="mb-4">
                <p className="eyebrow-gold">{t("crew.list.joinSectionEyebrow")}</p>
                <h3 className="font-display font-bold text-lg text-fg mt-1">
                  {t("crew.list.joinSectionTitle")}
                </h3>
                <p className="text-xs text-fg-mute mt-1">
                  {t("crew.list.joinSectionText")}
                </p>
              </header>
              <div className="flex flex-col gap-2.5">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  placeholder="X7K9P2"
                  maxLength={6}
                  disabled={busy}
                  className="field font-mono text-center tracking-[0.4em] text-xl uppercase"
                />
                <button
                  onClick={handleJoin}
                  disabled={busy || code.trim().length !== 6}
                  className="btn-primary py-3"
                >
                  {busy ? t("crew.list.joining") : t("crew.list.join")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
            style={{
              background: "rgba(255,45,85,0.10)",
              color: "#FF6B86",
              border: "1px solid rgba(255,45,85,0.30)",
            }}
          >
            <AlertTriangle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
