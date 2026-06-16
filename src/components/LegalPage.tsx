"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useT } from "@/lib/i18n";
import { getLegalContent, isAuthoritative, type LegalDoc } from "@/lib/legal-content";

const LAST_UPDATED: Record<string, string> = {
  de: "16. Juni 2026",
  en: "16 June 2026",
  fr: "16 juin 2026",
  es: "16 de junio de 2026",
};

const DOCS: LegalDoc[] = ["impressum", "datenschutz", "agb"];
const NAV_KEY: Record<LegalDoc, string> = {
  impressum: "legal.nav.impressum",
  datenschutz: "legal.nav.privacy",
  agb: "legal.nav.terms",
};

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t, locale } = useT();
  const content = getLegalContent(locale, doc);

  return (
    <main className="min-h-screen px-4 sm:px-8 pt-5 pb-32 sm:pb-16">
      {/* Header */}
      <header className="max-w-3xl mx-auto mb-8 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={26} />
          <span className="font-display font-extrabold tracking-tight text-sm sm:text-base text-fg">
            Rad der <span className="gradient-shame">Schande</span>
          </span>
        </Link>
        <Link href="/" className="btn-ghost !rounded-full">
          <ArrowLeft size={15} strokeWidth={2.4} />
          <span className="hidden sm:inline">{t("legal.back")}</span>
        </Link>
      </header>

      <article className="card-casino max-w-3xl mx-auto p-6 sm:p-10">
        <p className="eyebrow-gold mb-3">{t("legal.eyebrow")}</p>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-fg leading-tight">
          {content.title}
        </h1>

        <div className="mt-2 text-xs text-fg-mute">
          {t("legal.updated")}: {LAST_UPDATED[locale] ?? LAST_UPDATED.en}
        </div>

        {!isAuthoritative(locale) && (
          <div
            className="mt-4 rounded-xl px-4 py-2.5 text-xs"
            style={{
              background: "var(--surface-gold)",
              color: "var(--text-gold)",
              border: "1px solid var(--border-gold)",
            }}
          >
            {t("legal.authoritative")}
          </div>
        )}

        {content.intro && (
          <p className="mt-5 text-fg-soft leading-relaxed">{content.intro}</p>
        )}

        <div className="mt-8 space-y-8">
          {content.sections.map((s, i) => (
            <section key={i}>
              {s.h && (
                <h2 className="font-display font-bold text-lg sm:text-xl text-fg mb-2">
                  {s.h}
                </h2>
              )}
              <div className="space-y-2.5">
                {s.p.map((para, j) => (
                  <p key={j} className="text-sm sm:text-[15px] text-fg-soft leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Cross-Links */}
        <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-2">
          {DOCS.map((d) => {
            const active = d === doc;
            const href = d === "datenschutz" ? "/datenschutz" : d === "agb" ? "/agb" : "/impressum";
            return (
              <Link
                key={d}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "text-xs font-semibold transition " +
                  (active ? "text-gold-bright" : "text-fg-mute hover:text-fg-soft")
                }
              >
                {t(NAV_KEY[d])}
              </Link>
            );
          })}
        </div>
      </article>
    </main>
  );
}
