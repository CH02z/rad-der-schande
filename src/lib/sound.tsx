"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchPreferences } from "@/lib/preferences";

interface SoundCtx {
  muted: boolean;
  setMuted: (m: boolean) => void;
  toggle: () => void;
  synced: boolean;
}

const Ctx = createContext<SoundCtx | null>(null);

const STORAGE_KEY = "rds-muted";

async function loadFromServer(): Promise<boolean | null> {
  const data = await fetchPreferences();
  return typeof data?.muted === "boolean" ? data.muted : null;
}

async function saveToServer(muted: boolean) {
  try {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ muted }),
    });
  } catch {}
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const [synced, setSynced] = useState(false);
  const userChangedRef = useRef(false);

  useEffect(() => {
    // 1) localStorage als Cache
    let local = false;
    try {
      local = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    setMutedState(local);

    // 2) Server-Sync — überschreibt nur, wenn User noch nicht geändert hat
    loadFromServer().then((serverMuted) => {
      if (serverMuted === null) {
        setSynced(true);
        return;
      }
      if (!userChangedRef.current && serverMuted !== local) {
        try {
          localStorage.setItem(STORAGE_KEY, serverMuted ? "1" : "0");
        } catch {}
        setMutedState(serverMuted);
      }
      setSynced(true);
    });
  }, []);

  const setMuted = useCallback((m: boolean) => {
    userChangedRef.current = true;
    setMutedState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m ? "1" : "0");
    } catch {}
    void saveToServer(m);
  }, []);

  const toggle = useCallback(() => setMuted(!muted), [muted, setMuted]);

  return (
    <Ctx.Provider value={{ muted, setMuted, toggle, synced }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSound() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSound outside SoundProvider");
  return c;
}
