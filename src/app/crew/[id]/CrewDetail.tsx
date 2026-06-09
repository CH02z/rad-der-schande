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
  MessageCircle,
  MessageSquare,
  Mail,
  Sparkles,
  X,
  Target,
  Swords,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { useCrew } from "@/lib/crew-context";
import { useT } from "@/lib/i18n";
import CrewAvatar from "@/components/CrewAvatar";
import AvatarPicker from "@/components/AvatarPicker";
import StatsPanel from "@/components/StatsPanel";
import {
  buildInviteText,
  buildWhatsAppUrl,
  buildSmsUrl,
  buildMailtoUrl,
  copyToClipboard,
  nativeShare,
} from "@/lib/share";

interface Member {
  userId: string;
  name: string | null;
  nickname: string | null;
  displayName: string;
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
  emoji: string;
  accentColor: string;
  defaultMode: "classic" | "elim";
  consequences: string[];
  ownerId: string;
  createdAt: string;
  members: Member[];
  yourRole: "owner" | "admin" | "member";
}

export default function CrewDetail({ crewId }: { crewId: string }) {
  const router = useRouter();
  const { activeCrewId, setActiveCrewId, refresh } = useCrew();
  const { t } = useT();

  const [data, setData] = useState<CrewDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [previewEmoji, setPreviewEmoji] = useState("🎰");
  const [previewColor, setPreviewColor] = useState("#E8C36A");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);

  // Inline-Editor für Nicknames
  const [editingNickFor, setEditingNickFor] = useState<string | null>(null);
  const [nickValue, setNickValue] = useState("");

  // Crew-Settings (Owner-only)
  const [consequenceInput, setConsequenceInput] = useState("");

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
      setPreviewEmoji(d.emoji);
      setPreviewColor(d.accentColor);
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCopyCode() {
    if (!data) return;
    if (await copyToClipboard(data.code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  async function handleShareNative() {
    if (!data) return;
    if (await nativeShare({ crewName: data.name, code: data.code })) return;
    // Fallback Copy
    const text = buildInviteText({ crewName: data.name, code: data.code });
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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

  async function handleSaveAvatar(emoji: string, color: string) {
    if (!data) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/crews/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, accentColor: color }),
      });
      if (res.ok) {
        await Promise.all([load(), refresh()]);
        setAvatarOpen(false);
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

  async function updateCrew(patch: Partial<{ defaultMode: "classic" | "elim"; consequences: string[] }>) {
    if (!data) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/crews/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) await load();
    } finally {
      setBusy(false);
    }
  }

  async function addConsequence() {
    if (!data) return;
    const v = consequenceInput.trim();
    if (!v || data.consequences.length >= 20) return;
    if (data.consequences.includes(v)) {
      setConsequenceInput("");
      return;
    }
    const next = [...data.consequences, v];
    await updateCrew({ consequences: next });
    setConsequenceInput("");
  }

  async function removeConsequence(idx: number) {
    if (!data) return;
    const next = data.consequences.filter((_, i) => i !== idx);
    await updateCrew({ consequences: next });
  }

  async function handleSaveNick() {
    if (!data || !editingNickFor) return;
    const newNick = nickValue.trim();
    setBusy(true);
    try {
      const res = await fetch(
        `/api/crews/${data.id}/members/${editingNickFor}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: newNick || null }),
        }
      );
      if (res.ok) {
        await load();
        setEditingNickFor(null);
        setNickValue("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleTransfer() {
    if (!data || !transferTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/crews/${data.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: transferTarget.userId }),
      });
      if (res.ok) {
        await Promise.all([load(), refresh()]);
        setTransferTarget(null);
      }
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
  const inviteText = buildInviteText({ crewName: data.name, code: data.code });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/crew" className="btn-ghost">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">{t("crew.detail.back")}</span>
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
            {t("crew.detail.activeCrew")}
          </div>
        ) : (
          <button onClick={handleSetActive} className="btn-ghost text-xs">
            {t("crew.detail.setActive")}
          </button>
        )}
      </div>

      {/* Crew Header */}
      <div className="card-casino p-6 sm:p-7 text-center">
        <div className="mx-auto relative inline-block mb-4">
          <CrewAvatar
            emoji={data.emoji}
            color={data.accentColor}
            size={72}
          />
          {isOwner && (
            <button
              onClick={() => {
                setPreviewEmoji(data.emoji);
                setPreviewColor(data.accentColor);
                setAvatarOpen(true);
              }}
              className="absolute -bottom-1 -right-1 grid place-items-center w-7 h-7 rounded-full transition"
              style={{
                background: "var(--surface-strong)",
                border: "1px solid var(--border-strong)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
              aria-label={t("crew.detail.avatarChange")}
            >
              <Sparkles size={13} className="text-gold-bright" />
            </button>
          )}
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
          {data.members.length === 1
            ? t("crew.list.membersOne")
            : t("crew.list.membersMany")}
        </p>

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
                  {t("common.save")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code-Display */}
        <div className="mt-5">
          <p className="eyebrow-gold justify-center mb-2">{t("crew.detail.code")}</p>
          <div
            className="font-mono font-extrabold text-3xl sm:text-4xl tracking-[0.25em]"
            style={{ color: "var(--text-gold)" }}
          >
            {data.code}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-fg-mute mt-2">
            {t("crew.detail.directLink")}: /join/{data.code}
          </p>
        </div>

        {/* Share-Buttons Row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href={buildWhatsAppUrl(inviteText)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs py-2.5"
          >
            <MessageCircle size={14} className="text-felt-soft" />
            WhatsApp
          </a>
          <a
            href={buildSmsUrl(inviteText)}
            className="btn-ghost text-xs py-2.5"
          >
            <MessageSquare size={14} className="text-sky" />
            SMS
          </a>
          <a
            href={buildMailtoUrl(inviteText, data.name)}
            className="btn-ghost text-xs py-2.5"
          >
            <Mail size={14} className="text-fg-soft" />
            {t("crew.detail.email")}
          </a>
          <button onClick={handleCopyCode} className="btn-ghost text-xs py-2.5">
            {copied ? (
              <>
                <Check size={14} className="text-gold-bright" />
                {t("common.copied")}
              </>
            ) : (
              <>
                <Copy size={14} />
                {t("common.copy")}
              </>
            )}
          </button>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={handleShareNative}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-fg-soft hover:text-fg transition"
          >
            <Share2 size={12} /> {t("common.moreOptions")}
          </button>
        )}
      </div>

      {/* Stats Panel */}
      <StatsPanel crewId={data.id} />

      {/* Members */}
      <div className="card-casino p-5 sm:p-6">
        <header className="mb-3 flex items-center gap-2">
          <UsersIcon size={15} className="text-fg-mute" />
          <h2 className="font-display font-bold text-fg">{t("crew.detail.members")}</h2>
          <span className="text-xs text-fg-mute font-mono">
            ({data.members.length})
          </span>
        </header>
        <ul className="space-y-1">
          {data.members.map((m) => {
            const isEditing = editingNickFor === m.userId;
            return (
              <li
                key={m.userId}
                className="flex items-start gap-3 rounded-xl px-2 py-2"
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
                    {(m.displayName).slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        value={nickValue}
                        onChange={(e) => setNickValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveNick();
                          if (e.key === "Escape") {
                            setEditingNickFor(null);
                            setNickValue("");
                          }
                        }}
                        placeholder={m.name ?? t("crew.detail.nickPlaceholder")}
                        maxLength={30}
                        autoFocus
                        disabled={busy}
                        className="field text-sm py-2"
                      />
                      <button
                        onClick={handleSaveNick}
                        disabled={busy}
                        className="btn-primary text-xs px-3 py-2"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setEditingNickFor(null);
                          setNickValue("");
                        }}
                        disabled={busy}
                        className="btn-ghost text-xs px-2 py-2"
                        aria-label={t("common.cancel")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-fg truncate">
                          {m.displayName}
                        </span>
                        {m.nickname && (
                          <span
                            className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded"
                            style={{
                              background: "var(--surface-gold)",
                              color: "var(--text-gold)",
                            }}
                          >
                            Nick
                          </span>
                        )}
                        {m.isYou && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-fg-mute">
                            {t("common.you")}
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
                      {(m.nickname ? m.name : m.email) && (
                        <div className="text-xs text-fg-mute truncate">
                          {m.nickname ? m.name : m.email}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingNickFor(m.userId);
                          setNickValue(m.nickname ?? "");
                        }}
                        disabled={busy}
                        aria-label={t("crew.detail.setNickname")}
                        className="p-2 rounded-lg text-fg-mute hover:text-gold-bright hover:bg-gold/10 transition"
                        title={m.nickname ? t("crew.detail.changeNickname") : t("crew.detail.setNickname")}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {isOwner && !m.isYou && m.role !== "owner" && (
                      <>
                        <button
                          onClick={() => setTransferTarget(m)}
                          disabled={busy}
                          aria-label={t("crew.detail.makeOwner")}
                          className="p-2 rounded-lg text-fg-mute hover:text-gold-bright hover:bg-gold/10 transition"
                          title={t("crew.detail.makeOwner")}
                        >
                          <Crown size={14} />
                        </button>
                        <button
                          onClick={() => handleKick(m.userId)}
                          disabled={busy}
                          aria-label={t("crew.detail.kick")}
                          className="p-2 rounded-lg text-fg-mute hover:text-shame hover:bg-shame/10 transition"
                        >
                          <UserMinus size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* === Crew-Einstellungen (Owner-only) === */}
      {isOwner && (
        <div className="card-casino p-5 sm:p-6 space-y-5">
          <header className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-fg-mute" />
            <h2 className="font-display font-bold text-fg">{t("crew.detail.settings")}</h2>
          </header>

          {/* Default-Mode */}
          <div>
            <p className="eyebrow-gold mb-2">{t("crew.detail.defaultMode")}</p>
            <p className="text-xs text-fg-mute mb-3">
              {t("crew.detail.defaultModeHint")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "classic" as const, title: t("wheel.modes.classic"), Icon: Target, accent: "#FF2D55" },
                { id: "elim" as const, title: t("wheel.modes.elim"), Icon: Swords, accent: "#E8C36A" },
              ]).map((m) => {
                const active = data.defaultMode === m.id;
                const Icon = m.Icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => !busy && updateCrew({ defaultMode: m.id })}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all disabled:opacity-60"
                    style={{
                      background: active
                        ? `color-mix(in srgb, ${m.accent} 18%, transparent)`
                        : "var(--surface)",
                      color: active ? m.accent : "var(--text-soft)",
                      border: `1.5px solid ${active ? m.accent : "var(--border)"}`,
                    }}
                  >
                    <Icon size={14} strokeWidth={2.4} />
                    {m.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Konsequenzen */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="eyebrow-gold mb-0.5">{t("crew.detail.consequences")}</p>
                <p className="text-xs text-fg-mute">
                  {t("crew.detail.consequencesHint")}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-fg-mute tabular-nums">
                {data.consequences.length}/20
              </span>
            </div>

            {data.consequences.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence initial={false}>
                  {data.consequences.map((c, i) => (
                    <motion.span
                      key={c + i}
                      layout
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.18 }}
                      className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 text-sm font-medium"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      <span>{c}</span>
                      <button
                        onClick={() => removeConsequence(i)}
                        disabled={busy}
                        className="grid place-items-center w-6 h-6 rounded-full transition disabled:opacity-30 text-fg-mute hover:text-shame hover:bg-shame/10"
                        aria-label={t("common.remove")}
                      >
                        <X size={13} strokeWidth={2.6} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={consequenceInput}
                onChange={(e) => setConsequenceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConsequence())}
                placeholder={t("crew.detail.consequencePlaceholder")}
                maxLength={80}
                disabled={busy || data.consequences.length >= 20}
                className="field text-sm"
              />
              <button
                onClick={addConsequence}
                disabled={
                  busy ||
                  !consequenceInput.trim() ||
                  data.consequences.length >= 20
                }
                className="btn-ghost !rounded-2xl !px-4 !py-2.5 disabled:opacity-40"
                aria-label="Hinzufügen"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card-casino p-5 sm:p-6">
        <header className="mb-3">
          <p className="eyebrow-gold" style={{ color: "#FF6B86" }}>
            {t("crew.detail.dangerZone")}
          </p>
          <h2 className="font-display font-bold text-fg mt-1">{t("crew.detail.dangerTitle")}</h2>
        </header>
        {isOwner ? (
          <>
            <p className="text-sm text-fg-soft mb-4">
              {t("crew.detail.ownerDangerText")}
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-danger"
            >
              <Trash2 size={14} />
              {t("crew.detail.deleteCrew")}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-fg-soft mb-4">
              {t("crew.detail.memberDangerText")}
            </p>
            <button
              onClick={() => setConfirmLeave(true)}
              className="btn-danger"
            >
              <LogOut size={14} />
              {t("crew.detail.leaveCrew")}
            </button>
          </>
        )}
      </div>

      {/* Avatar-Picker */}
      <AvatarPicker
        open={avatarOpen}
        emoji={previewEmoji}
        color={previewColor}
        busy={busy}
        onClose={() => setAvatarOpen(false)}
        onPreviewChange={(e, c) => {
          setPreviewEmoji(e);
          setPreviewColor(c);
        }}
        onSave={handleSaveAvatar}
      />

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
                {confirmDelete
                  ? t("crew.detail.deleteConfirmTitle")
                  : t("crew.detail.leaveConfirmTitle")}
              </h3>
              <p className="text-sm text-fg-soft mb-6">
                {confirmDelete
                  ? t("crew.detail.deleteConfirmText")
                  : t("crew.detail.leaveConfirmText")}
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
                  {t("common.cancel")}
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
                      ? t("tabelle.deleteFinal")
                      : t("common.leave")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Confirm-Modal */}
      <AnimatePresence>
        {transferTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
            onClick={() => !busy && setTransferTarget(null)}
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
                  background: "var(--surface-gold)",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <Crown size={24} className="text-gold-bright" />
              </div>
              <h3 className="font-display font-bold text-2xl text-fg mb-1">
                {t("crew.detail.transferConfirmTitle")}
              </h3>
              <p className="text-sm text-fg-soft mb-6">
                <span className="font-semibold text-fg">
                  {transferTarget.name ?? t("crew.detail.thisMember")}
                </span>{" "}
                {t("crew.detail.transferConfirmText")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransferTarget(null)}
                  disabled={busy}
                  className="btn-ghost flex-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={busy}
                  className="btn-primary flex-1"
                >
                  {busy ? t("crew.detail.transferring") : t("crew.detail.transfer")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
