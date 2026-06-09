"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { useT } from "@/lib/i18n";

const STORAGE_KEY = "rds-consent";

export default function CookieConsent() {
  const { t } = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // kurze Verzögerung, damit es nicht mit dem Page-Load konkurriert
        const id = setTimeout(() => setShow(true), 600);
        return () => clearTimeout(id);
      }
    } catch {
      setShow(true);
    }
  }, []);

  function decide(choice: "all" | "essential") {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 1, choice, ts: Date.now() }),
      );
    } catch {}
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          role="dialog"
          aria-label={t("legal.cookies.title")}
          className="fixed inset-x-0 bottom-0 z-[70] px-3 pointer-events-none"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <div
            className="glass-strong pointer-events-auto mx-auto max-w-2xl rounded-3xl p-4 sm:p-5
                       mb-[96px] sm:mb-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
          >
            <div className="flex items-start gap-3 flex-1">
              <span
                className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
                style={{
                  background: "var(--surface-gold)",
                  color: "var(--text-gold)",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <Cookie size={18} />
              </span>
              <div>
                <div className="font-display font-bold text-fg text-sm">
                  {t("legal.cookies.title")}
                </div>
                <p className="text-xs text-fg-soft mt-0.5 leading-relaxed">
                  {t("legal.cookies.text")}{" "}
                  <Link href="/datenschutz" className="text-gold-bright hover:underline whitespace-nowrap">
                    {t("legal.cookies.more")}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => decide("essential")} className="btn-ghost flex-1 sm:flex-none">
                {t("legal.cookies.essential")}
              </button>
              <button onClick={() => decide("all")} className="btn-gold flex-1 sm:flex-none !py-2.5">
                {t("legal.cookies.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
