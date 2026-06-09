"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { CREW_EMOJIS, CREW_COLORS } from "@/lib/avatars";
import CrewAvatar from "@/components/CrewAvatar";

interface Props {
  open: boolean;
  emoji: string;
  color: string;
  onClose: () => void;
  onSave: (emoji: string, color: string) => void;
  onPreviewChange: (emoji: string, color: string) => void;
  busy?: boolean;
}

/**
 * Modal-Picker für Crew-Avatar — Owner-only.
 * Live-Preview oben, drunter Emoji-Grid + Color-Row.
 */
export default function AvatarPicker({
  open,
  emoji,
  color,
  onClose,
  onSave,
  onPreviewChange,
  busy,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 grid place-items-center px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          onClick={() => !busy && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-fg">
                Crew-Avatar
              </h3>
              <button
                onClick={onClose}
                disabled={busy}
                className="p-1.5 rounded-lg text-fg-mute hover:text-fg-soft transition"
                aria-label="Schliessen"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview */}
            <div className="grid place-items-center mb-5">
              <CrewAvatar emoji={emoji} color={color} size={80} />
            </div>

            {/* Emoji Grid */}
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-fg-mute mb-2">
                Emoji
              </p>
              <div className="grid grid-cols-8 gap-1.5">
                {CREW_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => onPreviewChange(e, color)}
                    className="aspect-square rounded-xl text-xl grid place-items-center transition"
                    style={{
                      background:
                        e === emoji ? `${color}33` : "var(--surface)",
                      border: `1.5px solid ${e === emoji ? color : "transparent"}`,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Row */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest font-bold text-fg-mute mb-2">
                Farbe
              </p>
              <div className="flex flex-wrap gap-2">
                {CREW_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onPreviewChange(emoji, c)}
                    className="w-10 h-10 rounded-xl grid place-items-center transition"
                    style={{
                      background: c,
                      border: `2.5px solid ${c === color ? "white" : "transparent"}`,
                      boxShadow:
                        c === color
                          ? `0 0 0 1px ${c}, 0 4px 12px ${c}66`
                          : undefined,
                    }}
                    aria-label={c}
                  >
                    {c === color && (
                      <Check size={16} strokeWidth={3} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={busy}
                className="btn-ghost flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={() => onSave(emoji, color)}
                disabled={busy}
                className="btn-primary flex-1"
              >
                {busy ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
