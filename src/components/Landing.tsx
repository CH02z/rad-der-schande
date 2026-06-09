"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Dices,
  Flame,
  Trophy,
  Users,
  Swords,
  Sparkles,
  Volume2,
  ShieldCheck,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useT, LOCALES, type Locale } from "@/lib/i18n";

/* === Mini-Wheel-Illustration === */
function MiniWheel({ size = 280 }: { size?: number }) {
  const segments = [
    "#FF2D55", "#E8C36A", "#5FE3C4", "#69A6FF", "#C589FF", "#FF8A3D",
  ];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const seg = (Math.PI * 2) / segments.length;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-70 -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,85,0.45), rgba(232,195,106,0.25) 50%, transparent 70%)",
        }}
      />
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        style={{ filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.4))" }}
      >
        <defs>
          <radialGradient id="gold-ring" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.78" stopColor="#FFD15C" />
            <stop offset="0.88" stopColor="#A07820" />
            <stop offset="1" stopColor="#3a2a08" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r + size * 0.04} fill="url(#gold-ring)" />
        {segments.map((color, i) => {
          const a0 = i * seg - Math.PI / 2;
          const a1 = (i + 1) * seg - Math.PI / 2;
          const x0 = cx + r * Math.cos(a0);
          const y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
              fill={color}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={size * 0.085} fill="#07060B" stroke="#FFD15C" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={size * 0.02} fill="#FFD15C" />
      </motion.svg>
      <svg width="36" height="44" viewBox="0 0 36 44" className="absolute z-20" style={{ top: -4 }}>
        <defs>
          <linearGradient id="lp-ptr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE8A8" />
            <stop offset="45%" stopColor="#FFD15C" />
            <stop offset="100%" stopColor="#A07820" />
          </linearGradient>
        </defs>
        <path d="M18 42 L4 12 Q4 4 12 4 L24 4 Q32 4 32 12 Z" fill="url(#lp-ptr)" stroke="#2a1f08" strokeWidth="1" />
        <circle cx="18" cy="12" r="2" fill="#2a1f08" />
      </svg>
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Feature({
  icon: Icon,
  color,
  title,
  text,
  delay = 0,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  color: string;
  title: string;
  text: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="card-casino p-6 h-full">
        <div
          className="grid place-items-center w-12 h-12 rounded-2xl mb-4"
          style={{
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
          }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <h3 className="font-display font-extrabold text-xl text-fg mb-2">{title}</h3>
        <p className="text-sm text-fg-soft leading-relaxed">{text}</p>
      </div>
    </Reveal>
  );
}

const FLAGS: Record<Locale, string> = { de: "🇩🇪", en: "🇬🇧", fr: "🇫🇷", es: "🇪🇸" };

/** Kleiner Locale-Switcher im Landing-Header */
function LangSwitcher() {
  const { locale, setLocale } = useT();
  return (
    <div
      className="hidden sm:inline-flex items-center gap-0.5 rounded-xl p-0.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {LOCALES.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className="grid place-items-center w-7 h-7 rounded-lg text-base transition"
            style={{
              background: active ? "var(--surface-strong)" : "transparent",
              opacity: active ? 1 : 0.5,
            }}
            aria-label={l}
          >
            {FLAGS[l]}
          </button>
        );
      })}
    </div>
  );
}

export default function Landing() {
  const { t } = useT();

  return (
    <main className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div
          className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5"
          style={{
            background: "color-mix(in srgb, var(--bg) 70%, transparent)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="font-display font-extrabold tracking-tight text-fg text-base sm:text-lg">
              Rad der <span className="gradient-shame">Schande</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LangSwitcher />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: "var(--surface-gold)",
                color: "var(--text-gold)",
                border: "1px solid var(--border-gold)",
              }}
            >
              {t("landing.signIn")}
              <ArrowRight size={14} strokeWidth={2.6} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow-gold justify-center lg:justify-start mb-4"
            >
              {t("landing.hero.eyebrow")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-black leading-[0.92] tracking-tight text-5xl sm:text-7xl lg:text-[5.5rem] text-fg"
            >
              {t("landing.hero.titlePre")}{" "}
              <span className="gradient-shame">
                {t("landing.hero.titleAccent")}
              </span>
              <span className="text-fg-faint">?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-5 text-fg-soft text-lg sm:text-xl max-w-xl mx-auto lg:mx-0"
            >
              {t("landing.hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link href="/login" className="btn-primary text-lg px-7 py-4 inline-flex justify-center">
                {t("landing.hero.ctaPrimary")}
                <ArrowRight size={18} strokeWidth={2.6} />
              </Link>
              <Link href="#features" className="btn-ghost text-base px-5 py-3.5 inline-flex justify-center">
                {t("landing.hero.ctaSecondary")}
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-xs text-fg-mute"
            >
              {t("landing.hero.note")}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="flex justify-center"
          >
            <MiniWheel size={340} />
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <p className="eyebrow-gold justify-center mb-3">{t("landing.features.eyebrow")}</p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-fg mb-3">
                {t("landing.features.titlePre")}{" "}
                <span className="gradient-shame">{t("landing.features.titleAccent")}</span>
              </h2>
              <p className="text-fg-soft text-base sm:text-lg max-w-2xl mx-auto">
                {t("landing.features.subtitle")}
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature icon={Dices} color="#FF2D55" title={t("landing.features.physicsTitle")} text={t("landing.features.physicsText")} />
            <Feature icon={Users} color="#E8C36A" delay={0.05} title={t("landing.features.crewsTitle")} text={t("landing.features.crewsText")} />
            <Feature icon={Trophy} color="#5FE3C4" delay={0.1} title={t("landing.features.tableTitle")} text={t("landing.features.tableText")} />
            <Feature icon={Swords} color="#69A6FF" delay={0.15} title={t("landing.features.modesTitle")} text={t("landing.features.modesText")} />
            <Feature icon={Flame} color="#C589FF" delay={0.2} title={t("landing.features.rivalsTitle")} text={t("landing.features.rivalsText")} />
            <Feature icon={Sparkles} color="#FF8A3D" delay={0.25} title={t("landing.features.nicksTitle")} text={t("landing.features.nicksText")} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-8 py-16 sm:py-20 border-y" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <p className="eyebrow-gold justify-center mb-3">{t("landing.howto.eyebrow")}</p>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-fg">{t("landing.howto.title")}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: "01", title: t("landing.howto.step1Title"), text: t("landing.howto.step1Text") },
              { step: "02", title: t("landing.howto.step2Title"), text: t("landing.howto.step2Text") },
              { step: "03", title: t("landing.howto.step3Title"), text: t("landing.howto.step3Text") },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="card-casino p-6 text-center h-full">
                  <div className="font-mono font-extrabold text-3xl mb-2" style={{ color: "var(--text-gold)" }}>
                    {s.step}
                  </div>
                  <h3 className="font-display font-bold text-lg text-fg mb-2">{s.title}</h3>
                  <p className="text-sm text-fg-soft">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-4 sm:px-8 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, label: t("landing.trust.private"), text: t("landing.trust.privateText") },
            { icon: Volume2, label: t("landing.trust.sound"), text: t("landing.trust.soundText") },
            { icon: Sparkles, label: t("landing.trust.idle"), text: t("landing.trust.idleText") },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.label} delay={i * 0.05}>
                <div className="flex items-start gap-3 p-4 rounded-2xl">
                  <div
                    className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
                    style={{ background: "var(--surface)", color: "var(--text-gold)" }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-fg text-sm">{t.label}</div>
                    <div className="text-xs text-fg-soft mt-0.5">{t.text}</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <div
            className="max-w-3xl mx-auto rounded-[36px] p-10 sm:p-14 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, var(--surface-strong), color-mix(in srgb, var(--bg-soft) 80%, transparent))",
              border: "1px solid var(--border-gold)",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,45,85,0.2), transparent 60%)" }}
            />
            <p className="eyebrow-gold justify-center mb-4 relative">{t("landing.cta.eyebrow")}</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-fg leading-tight mb-4 relative">
              {t("landing.cta.titlePre")}
              <br />
              <span className="gradient-shame">{t("landing.cta.titleAccent")}</span>
            </h2>
            <p className="text-fg-soft mb-7 max-w-md mx-auto relative">{t("landing.cta.subtitle")}</p>
            <div className="relative">
              <Link href="/login" className="btn-primary text-lg px-10 py-4 inline-flex">
                {t("landing.cta.button")}
                <ArrowRight size={18} strokeWidth={2.6} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="px-4 sm:px-8 py-10 text-center text-xs text-fg-faint">
        {t("landing.footer")}
      </footer>
    </main>
  );
}
