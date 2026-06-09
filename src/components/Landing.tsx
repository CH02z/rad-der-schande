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
import BindingDecree from "@/components/BindingDecree";
import { useT, LOCALES, type Locale } from "@/lib/i18n";

/* === Edles Casino-Rad — Gold-Bezel mit Studs, Juwel-Hub === */
function HeroWheel({ size = 340 }: { size?: number }) {
  const segments = [
    "#FF2D55", "#E8CE92", "#3DDC91", "#69A6FF", "#C589FF", "#FF8A3D",
  ];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.40;
  const rBezel = r + size * 0.055;
  const seg = (Math.PI * 2) / segments.length;
  const studs = 24;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* Spotlight / Felt-Glow */}
      <div
        className="absolute inset-[-18%] rounded-full blur-3xl -z-10 animate-glow-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(45,210,140,0.30), rgba(232,206,146,0.16) 48%, transparent 70%)",
        }}
      />

      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{ filter: "drop-shadow(0 30px 70px rgba(0,0,0,0.5))" }}
      >
        <defs>
          <radialGradient id="hw-bezel" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.74" stopColor="#3a2a08" />
            <stop offset="0.82" stopColor="#C49A40" />
            <stop offset="0.90" stopColor="#FBE7B0" />
            <stop offset="0.96" stopColor="#A07820" />
            <stop offset="1" stopColor="#2a1f08" />
          </radialGradient>
          <radialGradient id="hw-hub" cx="0.4" cy="0.36" r="0.7">
            <stop offset="0" stopColor="#FF6B86" />
            <stop offset="0.5" stopColor="#E5163F" />
            <stop offset="1" stopColor="#5c0419" />
          </radialGradient>
          <radialGradient id="hw-gloss" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="0.55" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Gold-Bezel */}
        <circle cx={cx} cy={cy} r={rBezel} fill="url(#hw-bezel)" />

        {/* Studs auf dem Bezel */}
        {Array.from({ length: studs }).map((_, i) => {
          const a = (i / studs) * Math.PI * 2;
          const rr = (r + rBezel) / 2;
          return (
            <circle
              key={i}
              cx={cx + rr * Math.cos(a)}
              cy={cy + rr * Math.sin(a)}
              r={size * 0.0085}
              fill="#FFF3D2"
              opacity={0.9}
            />
          );
        })}

        {/* Segmente */}
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
              stroke="rgba(0,0,0,0.28)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Glanz-Overlay */}
        <circle
          cx={cx - size * 0.12}
          cy={cy - size * 0.14}
          r={r * 0.95}
          fill="url(#hw-gloss)"
          opacity="0.5"
        />

        {/* Juwel-Hub */}
        <circle cx={cx} cy={cy} r={size * 0.092} fill="#07060B" stroke="#FBE7B0" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={size * 0.062} fill="url(#hw-hub)" />
        <circle cx={cx - size * 0.018} cy={cy - size * 0.02} r={size * 0.016} fill="rgba(255,255,255,0.7)" />
      </motion.svg>

      {/* Pointer */}
      <svg width="38" height="46" viewBox="0 0 38 46" className="absolute z-20" style={{ top: -6 }}>
        <defs>
          <linearGradient id="hw-ptr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF3D2" />
            <stop offset="45%" stopColor="#E6C879" />
            <stop offset="100%" stopColor="#A07820" />
          </linearGradient>
        </defs>
        <path d="M19 44 L4 13 Q4 4 13 4 L25 4 Q34 4 34 13 Z" fill="url(#hw-ptr)" stroke="#2a1f08" strokeWidth="1.2" />
        <circle cx="19" cy="13" r="2.4" fill="#2a1f08" />
      </svg>
    </div>
  );
}

/* === Schwebender Poker-Chip === */
function Chip({
  color,
  size = 56,
  className = "",
  delay = 0,
  duration = 5,
}: {
  color: string;
  size?: number;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={"absolute pointer-events-none " + className}
      initial={{ y: 0 }}
      animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))" }}>
        <circle cx="32" cy="32" r="30" fill={color} />
        <circle cx="32" cy="32" r="30" fill="none" stroke="#FBE7B0" strokeWidth="2.5" strokeDasharray="6 6" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
        <circle cx="32" cy="32" r="9" fill="rgba(255,255,255,0.85)" />
      </svg>
    </motion.div>
  );
}

/* === Funkeln === */
function Sparkle({ className = "", delay = 0, s = 14 }: { className?: string; delay?: number; s?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      className={"absolute animate-twinkle pointer-events-none " + className}
      style={{ animationDelay: `${delay}s` }}
      fill="#FBE7B0"
    >
      <path d="M12 0 L14 9 L24 12 L14 15 L12 24 L10 15 L0 12 L10 9 Z" />
    </svg>
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
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="card-casino p-6 h-full group"
      >
        <div
          className="relative grid place-items-center w-12 h-12 rounded-2xl mb-4 overflow-hidden"
          style={{
            background: `color-mix(in srgb, ${color} 20%, transparent)`,
            color,
            boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 30%, transparent) inset`,
          }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <h3 className="font-display font-extrabold text-xl text-fg mb-2">{title}</h3>
        <p className="text-sm text-fg-soft leading-relaxed">{text}</p>
      </motion.div>
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
    <main className="relative min-h-screen overflow-x-clip">
      {/* HEADER */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div
          className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5"
          style={{
            background: "color-mix(in srgb, var(--bg) 68%, transparent)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 30px -16px rgba(0,0,0,0.6)",
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
      <section className="relative px-4 sm:px-8 pt-10 sm:pt-16 pb-14 sm:pb-20">
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
              className="font-display font-black leading-[0.9] tracking-tight text-5xl sm:text-7xl lg:text-[5.5rem] text-fg"
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
            className="relative flex justify-center"
          >
            <HeroWheel size={350} />
            {/* Schwebende Chips + Funkeln */}
            <Chip color="#E5163F" size={58} className="left-[2%] top-[12%]" delay={0} duration={5} />
            <Chip color="#0F8A57" size={46} className="right-[4%] top-[6%]" delay={0.8} duration={6} />
            <Chip color="#C49A40" size={50} className="right-[8%] bottom-[8%]" delay={0.4} duration={5.5} />
            <Sparkle className="left-[14%] bottom-[18%]" delay={0.2} s={16} />
            <Sparkle className="right-[20%] top-[26%]" delay={1.1} s={12} />
            <Sparkle className="left-[28%] top-[8%]" delay={1.8} s={10} />
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 sm:mt-16 rule-gold" />
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
            <Feature icon={Users} color="#E8CE92" delay={0.05} title={t("landing.features.crewsTitle")} text={t("landing.features.crewsText")} />
            <Feature icon={Trophy} color="#3DDC91" delay={0.1} title={t("landing.features.tableTitle")} text={t("landing.features.tableText")} />
            <Feature icon={Swords} color="#69A6FF" delay={0.15} title={t("landing.features.modesTitle")} text={t("landing.features.modesText")} />
            <Feature icon={Flame} color="#C589FF" delay={0.2} title={t("landing.features.rivalsTitle")} text={t("landing.features.rivalsText")} />
            <Feature icon={Sparkles} color="#FF8A3D" delay={0.25} title={t("landing.features.nicksTitle")} text={t("landing.features.nicksText")} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <p className="eyebrow-gold justify-center mb-3">{t("landing.howto.eyebrow")}</p>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-fg">{t("landing.howto.title")}</h2>
            </div>
          </Reveal>
          <div className="relative grid sm:grid-cols-3 gap-5">
            {/* Verbindungslinie */}
            <div
              className="hidden sm:block absolute left-[16%] right-[16%] top-12 h-px -z-0"
              style={{ background: "linear-gradient(90deg, transparent, var(--border-gold), transparent)" }}
            />
            {[
              { step: "01", title: t("landing.howto.step1Title"), text: t("landing.howto.step1Text") },
              { step: "02", title: t("landing.howto.step2Title"), text: t("landing.howto.step2Text") },
              { step: "03", title: t("landing.howto.step3Title"), text: t("landing.howto.step3Text") },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="card-casino p-6 text-center h-full relative">
                  <div
                    className="mx-auto mb-3 grid place-items-center w-12 h-12 rounded-2xl font-display font-black text-xl"
                    style={{
                      background: "var(--surface-gold)",
                      color: "var(--text-gold)",
                      border: "1px solid var(--border-gold)",
                    }}
                  >
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
          ].map((tr, i) => {
            const Icon = tr.icon;
            return (
              <Reveal key={tr.label} delay={i * 0.05}>
                <div className="glass flex items-start gap-3 p-4 rounded-2xl h-full">
                  <div
                    className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
                    style={{
                      background: "var(--surface-gold)",
                      color: "var(--text-gold)",
                      border: "1px solid var(--border-gold)",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-fg text-sm">{tr.label}</div>
                    <div className="text-xs text-fg-soft mt-0.5">{tr.text}</div>
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
                "linear-gradient(180deg, var(--panel-top), color-mix(in srgb, var(--felt-deep) 55%, var(--panel-bottom)))",
              border: "1px solid var(--border-gold)",
              boxShadow: "var(--shadow-gold), var(--shadow-card)",
            }}
          >
            {/* Doppel-Gold-Rahmen */}
            <div
              aria-hidden
              className="absolute inset-3 rounded-[28px] pointer-events-none"
              style={{ border: "1px solid var(--border-gold)" }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% -10%, rgba(45,210,140,0.22), transparent 55%)" }}
            />
            <Sparkle className="left-[12%] top-[18%]" delay={0.3} s={14} />
            <Sparkle className="right-[14%] bottom-[22%]" delay={1.2} s={12} />

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

      <footer className="px-4 sm:px-8 py-10">
        <div className="max-w-5xl mx-auto rule-gold mb-7" />
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/impressum" className="text-fg-mute hover:text-fg-soft transition">{t("legal.nav.impressum")}</Link>
            <Link href="/datenschutz" className="text-fg-mute hover:text-fg-soft transition">{t("legal.nav.privacy")}</Link>
            <Link href="/agb" className="text-fg-mute hover:text-fg-soft transition">{t("legal.nav.terms")}</Link>
            <BindingDecree variant="link" />
          </nav>
          <p className="text-center text-xs text-fg-faint">{t("landing.footer")}</p>
        </div>
      </footer>
    </main>
  );
}
