"use client";

import { useT } from "@/lib/i18n";

export default function CrewHero() {
  const { t } = useT();
  return (
    <section className="max-w-2xl mx-auto text-center mb-6 sm:mb-10">
      <p className="uppercase tracking-[0.32em] text-[10px] sm:text-xs text-text-gold mb-2 sm:mb-3 font-semibold">
        {t("crew.list.eyebrow")}
      </p>
      <h1 className="font-display font-black leading-[0.92] tracking-tight text-4xl sm:text-6xl text-fg">
        {t("crew.list.titlePre")}{" "}
        <span className="gradient-shame">{t("crew.list.titleAccent")}</span>
      </h1>
      <p className="mt-2 sm:mt-3 text-fg-soft text-sm sm:text-base">
        {t("crew.list.subtitle")}
      </p>
    </section>
  );
}
