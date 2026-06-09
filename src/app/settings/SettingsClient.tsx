"use client";

import { Moon, Sun, Volume2, VolumeX, Globe, Check } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useSound } from "@/lib/sound";
import { useT, LOCALES, type Locale } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useT();
  return (
    <div className="segmented grid grid-cols-2 w-full max-w-[260px]">
      <button
        onClick={() => setTheme("dark")}
        data-active={theme === "dark"}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <Moon size={14} /> {t("settings.themeDark")}
      </button>
      <button
        onClick={() => setTheme("light")}
        data-active={theme === "light"}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <Sun size={14} /> {t("settings.themeLight")}
      </button>
    </div>
  );
}

export function SoundToggle() {
  const { muted, setMuted } = useSound();
  const { t } = useT();
  return (
    <div className="segmented grid grid-cols-2 w-full max-w-[260px]">
      <button
        onClick={() => setMuted(false)}
        data-active={!muted}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <Volume2 size={14} /> {t("settings.soundOn")}
      </button>
      <button
        onClick={() => setMuted(true)}
        data-active={muted}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <VolumeX size={14} /> {t("settings.soundOff")}
      </button>
    </div>
  );
}

const LOCALE_FLAGS: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
};

export function LocaleSelector() {
  const { locale, setLocale, t } = useT();
  return (
    <div className="grid grid-cols-2 gap-2 max-w-md">
      {LOCALES.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className="inline-flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: active ? "var(--surface-gold)" : "var(--surface)",
              color: active ? "var(--text-gold)" : "var(--text-soft)",
              border: `1.5px solid ${active ? "var(--border-gold)" : "var(--border)"}`,
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-base leading-none">{LOCALE_FLAGS[l]}</span>
              {t(`languages.${l}`)}
            </span>
            {active && <Check size={14} strokeWidth={2.6} />}
          </button>
        );
      })}
    </div>
  );
}

/** Re-exports for back-compat */
export { Globe };
