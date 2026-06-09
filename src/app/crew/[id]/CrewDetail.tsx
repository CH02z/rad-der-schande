"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  Crown,
  Users as UsersIcon,
  LogOut,
  Trash2,
  Pencil,
  UserMinus,
  AlertTriangle,
  Share2,
} from "lucide-react";
import { useCrew } from "@/lib/crew-context";

interface Member {
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  isYou: boolean;
}

interface CrewDetailData {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members: Member[];
  yourRole: "owner" | "admin" | "member";
}

export default function CrewDetail({ crewId }: { crewId: string }) {
  const router = useRouter();
  const { activeCrewId, setActiveCrewId, refresh } = useCrew();

  const [data, setData] = useState<CrewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crews/${crewId}`);
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Fehler" }));
        setError(error || "Crew nicht gefunden");
        return;
      }
      const d = (await res.json()) as CrewDetailData;
      setData(d);
      setRenameValue(d.name);
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCopyCode() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function handleShare() {
    if (!data) return;
    const text = `Tritt meiner Crew "${data.name}" bei: Code ${data.code}\nhttps://rad-der-schande.ch`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Rad der Schande", text });
        return;
      } catch {}
    }
    await handleCopyCode();
  }

  async function handleSetActive() {
    if (!data) return;
    await setActiveCrewId(data.id);
  }

  async function handleRename() {
    if (!data) return;
    const trimmed = renameValue.trim();
    if (trimmed.length < 2 || trimmed === data.name) {
      setRenameOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/crews/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        await Promise.all([load(), refresh()]);
        setRenameOpen(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!data) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/crews/${data.id}`, { method: "DELETE" });
      if (res.ok) {
        await refresh();
        router.push("/crew");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    if (!data) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/crews/${data.id}/leave`, { method: "POST" });
      if (res.ok) {
        await refresh();
        router.push("/crew");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleKick(memberId: string) {
    if (!data) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/crews/${data.id}/members/${memberId}`,
        { method: "DELETE" }
      );
      if (res.ok) await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-32 rounded-3xl bg-surface animate-pulse" />
        <div className="h-48 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card-casino p-8">
          <AlertTriangle size={32} className="text-shame mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-fg mb-2">
            {error || "Crew nicht verfügbar"}
          </h2>
          <Link href="/crew" className="btn-ghost mt-4">
            <ArrowLeft size={14} /> Zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = data.yourRole === "owner";
  const isActive = activeCrewId === data.id;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header: Back + Active-State */}
      <div className="flex items-center justify-between">
        <Link href="/crew" className="btn-ghost">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Crews</span>
        </Link>
        {isActive ? (
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            style={{
              background: "var(--surface-gold)",
              color: "var(--text-gold)",
              border: "1px solid var(--border-gold)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--text-gold)", boxShadow: "0 0 8px var(--text-gold)" }}
            />
            Aktive Crew
          </div>
        ) : (
          <button
            onClick={handleSetActive}
            className="btn-ghost text-xs"
          >
            Als aktiv setzen
          </button>
        )}
      </div>

      {/* Crew Header */}
      <div className="card-casino p-6 sm:p-7 text-center">
        <div
          className="mx-auto grid place-items-center w-16 h-16 rounded-2xl mb-4 font-display font-black text-3xl"
          style={{
            background: "var(--surface-gold)",
            color: "var(--text-gold)",
          }}
        >
          {data.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-fg">
            {data.name}
          </h1>
          {isOwner && (
            <button
              onClick={() => setRenameOpen((o) => !o)}
              className="p-1 rounded-lg text-fg-mute hover:text-fg-soft transition"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
        <p className="text-xs text-fg-mute">
          {data.members.length}{" "}
          {data.members.length === 1 ? "Mitglied" : "Mitglieder"}
        </p>

        {/* Rename Input */}
        <AnimatePresence>
          {renameOpen && isOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 max-w-sm mx-auto mt-4">
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  className="field text-sm"
                  maxLength={40}
                />
                <button
                  onClick={handleRename}
                  disabled={busy}
                  className="btn-primary text-sm px-4"
                >
                  Speichern
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code-Display */}
        <div className="mt-5">
          <p className="eyebrow-gold justify-center mb-2">Crew-Code</p>
          <div
            className="font-mono font-extrabold text-3xl sm:text-4xl tracking-[0.25em]"
            style={{ color: "var(--text-gold)" }}
          >
            {data.code}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={handleCopyCode}
              className="btn-ghost text-sm"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-gold-bright" /> Kopiert
                </>
              ) : (
                <>
                  <Copy size={14} /> Code kopieren
                </>
              )}
            </button>
            <button onClick={handleShare} className="btn-ghost text-sm">
              <Share2 size={14} /> Teilen
            </button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card-casino p-5 sm:p-6">
        <header className="mb-3 flex items-center gap-2">
          <UsersIcon size={15} className="text-fg-mute" />
          <h2 className="font-display font-bold text-fg">Mitglieder</h2>
          <span className="text-xs text-fg-mute font-mono">
            ({data.members.length})
          </span>
        </header>
        <ul className="space-y-1">
          {data.members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center gap-3 rounded-xl px-2 py-2"
            >
              {m.image ? (
                <Image
                  src={m.image}
                  alt={m.name ?? ""}
                  width={36}
                  height={36}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div
                  className="grid place-items-center w-9 h-9 rounded-full shrink-0 font-bold"
                  style={{ background: "var(--surface)", color: "var(--text-soft)" }}
                >
                  {(m.name ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-fg truncate">
                    {m.name ?? "Anonym"}
                  </span>
                  {m.isYou && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-fg-mute">
                      Du
                    </span>
                  )}
                  {m.role === "owner" && (
                    <Crown
                      size={12}
                      className="text-gold-bright"
                      strokeWidth={2.4}
                    />
                  )}
                </div>
                {m.email && (
                  <div className="text-xs text-fg-mute truncate">{m.email}</div>
                )}
              </div>
              {isOwner && !m.isYou && (
                <button
                  onClick={() => handleKick(m.userId)}
                  disabled={busy}
                  aria-label="Kicken"
                  className="p-2 rounded-lg text-fg-mute hover:text-shame hover:bg-shame/10 transition"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="card-casino p-5 sm:p-6">
        <header className="mb-3">
          <p className="eyebrow-gold" style={{ color: "#FF6B86" }}>
            Achtung
          </p>
          <h2 className="font-display font-bold text-fg mt-1">Crew verlassen</h2>
        </header>
        {isOwner ? (
          <>
            <p className="text-sm text-fg-soft mb-4">
              Als Owner kannst du die Crew nur löschen. Alle Spin-Einträge
              werden unwiderruflich entfernt.
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-danger"
            >
              <Trash2 size={14} />
              Crew löschen
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-fg-soft mb-4">
              Du verlässt die Crew. Deine Spin-Einträge bleiben in der Crew-Tabelle.
            </p>
            <button
              onClick={() => setConfirmLeave(true)}
              className="btn-danger"
            >
              <LogOut size={14} />
              Crew verlassen
            </button>
          </>
        )}
      </div>

      {/* Confirm-Modals */}
      <AnimatePresence>
        {(confirmDelete || confirmLeave) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
            onClick={() => {
              if (!busy) {
                setConfirmDelete(false);
                setConfirmLeave(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-7 max-w-sm w-full text-center"
            >
              <div
                className="grid place-items-center w-14 h-14 mx-auto mb-3 rounded-full"
                style={{
                  background: "rgba(255,45,85,0.12)",
                  border: "1px solid rgba(255,45,85,0.3)",
                }}
              >
                <AlertTriangle size={24} className="text-shame" />
              </div>
              <h3 className="font-display font-bold text-2xl text-fg mb-1">
                {confirmDelete ? "Crew löschen?" : "Crew verlassen?"}
              </h3>
              <p className="text-sm text-fg-soft mb-6">
                {confirmDelete
                  ? "Alle Mitglieder fliegen raus, alle Spin-Einträge werden gelöscht. Unwiderruflich."
                  : "Du verlässt die Crew. Du kannst über den Code wieder beitreten."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfirmDelete(false);
                    setConfirmLeave(false);
                  }}
                  disabled={busy}
                  className="btn-ghost flex-1"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => (confirmDelete ? handleDelete() : handleLeave())}
                  disabled={busy}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(180deg, #FF4A6E 0%, #B30032 100%)",
                    boxShadow: "0 8px 24px -6px rgba(255,45,85,0.5)",
                  }}
                >
                  {busy
                    ? "…"
                    : confirmDelete
                      ? "Endgültig löschen"
                      : "Verlassen"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
