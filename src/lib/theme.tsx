"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** true sobald wir den Wert vom Server gesynct haben */
  synced: boolean;
}

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "rds-theme";

function applyToDOM(t: Theme) {
  document.documentElement.classList.toggle("light", t === "light");
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {}
}

async function loadFromServer(): Promise<Theme | null> {
  try {
    const res = await fetch("/api/preferences");
    if (!res.ok) return null;
    const data: { theme?: Theme } = await res.json();
    if (data.theme === "dark" || data.theme === "light") return data.theme;
    return null;
  } catch {
    return null;
  }
}

async function saveToServer(theme: Theme) {
  try {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [synced, setSynced] = useState(false);
  // Verhindert, dass der initiale Server-Sync den User-Click wieder überschreibt
  const userChangedRef = useRef(false);

  useEffect(() => {
    // 1) State aus DOM lesen (inline-Script hat schon entschieden)
    const current = document.documentElement.classList.contains("light") ? "light" : "dark";
    setThemeState(current);

    // 2) Vom Server nachladen — überschreibt nur, wenn User nicht in der Zwischenzeit getoggelt hat
    loadFromServer().then((serverTheme) => {
      if (!serverTheme) {
        setSynced(true);
        return;
      }
      if (!userChangedRef.current && serverTheme !== current) {
        applyToDOM(serverTheme);
        setThemeState(serverTheme);
      }
      setSynced(true);
    });
  }, []);

  const setTheme = useCallback((t: Theme) => {
    userChangedRef.current = true;
    setThemeState(t);
    applyToDOM(t);
    void saveToServer(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <Ctx.Provider value={{ theme, setTheme, toggle, synced }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme outside ThemeProvider");
  return c;
}

// Inline-Script vor Hydration: kein FOUC
export const THEME_INIT_SCRIPT = `
(function(){try{
  var t = localStorage.getItem("${STORAGE_KEY}");
  if(!t){ t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; }
  if(t === "light") document.documentElement.classList.add("light");
}catch(e){}})();
`;
