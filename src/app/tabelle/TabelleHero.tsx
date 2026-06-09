"use client";

import { useT } from "@/lib/i18n";

export default function TabelleHero() {
  const { t } = useT();
  return (
    <section className="max-w-2xl mx-auto text-center mb-6 sm:mb-10">
      <p className="uppercase tracking-[0.32em] text-[10px] sm:text-xs text-gold/80 mb-2 sm:mb-3 font-semibold">
        {t("tabelle.eyebrow")}
      </p>
      <h1 className="font-display font-black leading-[0.92] tracking-tight text-4xl sm:text-6xl text-fg">
        {t("tabelle.title")
          .split(/(Tabelle|Table|Tabla|Classement)/)
          .map((part, i) => {
            const isAccent =
              part === "Tabelle" ||
              part === "Table" ||
              part === "Tabla" ||
              part === "Classement";
            return isAccent ? (
              <span key={i} className="gradient-shame">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            );
          })}
      </h1>
      <p className="mt-2 sm:mt-3 text-fg-soft text-sm sm:text-base">
        {t("tabelle.subtitle")}
      </p>
    </section>
  );
}
