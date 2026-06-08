"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SoundCtx {
  muted: boolean;
  setMuted: (m: boolean) => void;
  toggle: () => void;
}

const Ctx = createContext<SoundCtx | null>(null);

const STORAGE_KEY = "rds-muted";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    try {
      setMutedState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m ? "1" : "0");
    } catch {}
  }, []);

  const toggle = useCallback(() => setMuted(!muted), [muted, setMuted]);

  return <Ctx.Provider value={{ muted, setMuted, toggle }}>{children}</Ctx.Provider>;
}

export function useSound() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSound outside SoundProvider");
  return c;
}
