"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import deMessages from "@/messages/de.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import esMessages from "@/messages/es.json";
import { fetchPreferences } from "@/lib/preferences";

export type Locale = "de" | "en" | "fr" | "es";
export const LOCALES: Locale[] = ["de", "en", "fr", "es"];
export const DEFAULT_LOCALE: Locale = "de";

type Messages = typeof deMessages;
const MESSAGES: Record<Locale, Messages> = {
  de: deMessages,
  en: enMessages,
  fr: frMessages,
  es: esMessages,
};

const STORAGE_KEY = "rds-locale";

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Übersetzt einen Key (dot-notation). Optional mit {var}-Interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  synced: boolean;
}

const Ctx = createContext<I18nCtx | null>(null);

function lookup(dict: Record<string, unknown>, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>((acc, k) => {
      if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[k];
      }
      return undefined;
    }, dict);
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang = (navigator.language || "").slice(0, 2).toLowerCase();
  return (LOCALES as string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
}

async function loadFromServer(): Promise<Locale | null> {
  const data = await fetchPreferences();
  if (data?.locale && (LOCALES as string[]).includes(data.locale)) {
    return data.locale;
  }
  return null;
}

async function saveToServer(locale: Locale) {
  try {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
  } catch {}
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [synced, setSynced] = useState(false);
  const userChangedRef = useRef(false);

  useEffect(() => {
    // 1) Aus localStorage oder Browser-Sprache
    let initial: Locale = DEFAULT_LOCALE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && (LOCALES as string[]).includes(stored)) {
        initial = stored;
      } else {
        initial = detectBrowserLocale();
      }
    } catch {
      initial = detectBrowserLocale();
    }
    setLocaleState(initial);
    document.documentElement.lang = initial;

    // 2) Vom Server nachladen (für eingeloggte User)
    loadFromServer().then((serverLocale) => {
      if (
        serverLocale &&
        serverLocale !== initial &&
        !userChangedRef.current
      ) {
        try {
          localStorage.setItem(STORAGE_KEY, serverLocale);
        } catch {}
        document.documentElement.lang = serverLocale;
        setLocaleState(serverLocale);
      }
      setSynced(true);
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    userChangedRef.current = true;
    setLocaleState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    void saveToServer(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = MESSAGES[locale] as unknown as Record<string, unknown>;
      const value = lookup(dict, key);
      if (typeof value !== "string") {
        // Fallback auf Default-Locale
        const fallback = lookup(
          MESSAGES[DEFAULT_LOCALE] as unknown as Record<string, unknown>,
          key
        );
        if (typeof fallback === "string") {
          return vars
            ? fallback.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
            : fallback;
        }
        return key;
      }
      return vars
        ? value.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))
        : value;
    },
    [locale]
  );

  return (
    <Ctx.Provider value={{ locale, setLocale, t, synced }}>
      {children}
    </Ctx.Provider>
  );
}

export function useT() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useT outside I18nProvider");
  return c;
}
