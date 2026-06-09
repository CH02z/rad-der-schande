"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Easter-Egg: „Verbindlichkeitserklärung des Rades" — ein augenzwinkernd
 * offizielles Dekret. variant steuert nur das Aussehen des Triggers.
 */
export default function BindingDecree({
  variant = "link",
}: {
  variant?: "link" | "fineprint";
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const paras = ["p1", "p2", "p3", "p4", "p5"].map((k) =>
    t(`legal.decree.${k}`),
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          variant === "fineprint"
            ? "text-[10px] uppercase tracking-[0.2em] text-white/35 hover:text-white/60 transition"
            : "inline-flex items-center gap-1.5 text-xs font-medium text-fg-mute hover:text-gold-bright transition"
        }
      >
        {variant !== "fineprint" && <Scale size={12} strokeWidth={2.2} />}
        {t("legal.decree.trigger")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[80] grid place-items-center px-4 py-8 overflow-y-auto"
            style={{
              background: "radial-gradient(circle at 50% 20%, rgba(12,40,26,0.7), rgba(0,0,0,0.8))",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0, rotate: -1 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative card-casino max-w-lg w-full my-auto p-7 sm:p-9"
            >
              {/* Doppel-Gold-Rahmen */}
              <div
                aria-hidden
                className="absolute inset-2.5 rounded-[20px] pointer-events-none"
                style={{ border: "1px solid var(--border-gold)" }}
              />

              <button
                onClick={() => setOpen(false)}
                aria-label={t("common.cancel")}
                className="absolute top-3.5 right-3.5 grid place-items-center w-8 h-8 rounded-full text-fg-mute hover:text-fg transition"
                style={{ background: "var(--surface)" }}
              >
                <X size={15} strokeWidth={2.4} />
              </button>

              {/* Siegel */}
              <div className="relative flex flex-col items-center text-center mb-5">
                <div
                  className="grid place-items-center w-16 h-16 rounded-full mb-3"
                  style={{
                    background: "radial-gradient(circle at 38% 32%, #FBE7B0, #C49A40 70%)",
                    boxShadow: "0 6px 20px -6px rgba(196,154,64,0.7), 0 0 0 4px rgba(232,206,146,0.18)",
                    color: "#3a2a08",
                  }}
                >
                  <span className="font-display font-black text-3xl leading-none">§</span>
                </div>
                <p className="eyebrow-gold justify-center mb-2">{t("legal.decree.eyebrow")}</p>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-fg leading-tight">
                  {t("legal.decree.title")}
                </h2>
              </div>

              <p className="relative text-sm text-fg-soft italic mb-4">
                {t("legal.decree.intro")}
              </p>

              <ol className="relative space-y-3 list-none">
                {paras.map((para, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-fg-soft leading-relaxed">
                    <span className="font-display font-bold text-gold-bright tabular-nums shrink-0">
                      §&nbsp;{i + 1}
                    </span>
                    <span>{para}</span>
                  </li>
                ))}
              </ol>

              <p className="relative mt-5 text-[11px] text-fg-mute leading-relaxed border-t border-line pt-4">
                {t("legal.decree.fineprint")}
              </p>

              <div className="relative mt-5 flex items-end justify-between gap-4">
                <div className="text-xs text-fg-mute">
                  <div
                    className="font-display text-xl text-fg-soft mb-0.5"
                    style={{ fontFamily: "cursive" }}
                  >
                    🎰
                  </div>
                  {t("legal.decree.sign")}
                </div>
                <button onClick={() => setOpen(false)} className="btn-gold !py-2.5 shrink-0">
                  {t("legal.decree.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
