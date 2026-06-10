"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchPreferences } from "@/lib/preferences";

export interface CrewSummary {
  id: string;
  code: string;
  name: string;
  emoji: string;
  accentColor: string;
  ownerId: string;
  role: "owner" | "admin" | "member";
  memberCount: number;
  createdAt: string;
}

interface CrewCtx {
  crews: CrewSummary[];
  activeCrewId: string | null;
  activeCrew: CrewSummary | null;
  loading: boolean;
  /** Wechselt die aktive Crew (oder null = Solo) — sync mit /api/preferences */
  setActiveCrewId: (id: string | null) => Promise<void>;
  /** Re-fetcht Liste + aktive Crew (z.B. nach Create/Join/Leave) */
  refresh: () => Promise<void>;
}

const Ctx = createContext<CrewCtx | null>(null);

export function CrewProvider({ children }: { children: React.ReactNode }) {
  const [crews, setCrews] = useState<CrewSummary[]>([]);
  const [activeCrewId, setActiveCrewIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Crew-Liste immer frisch; Preferences via geteiltem Cache (dedupliziert
  // mit Theme/Sound/i18n). force=true erzwingt frische Preferences.
  const load = useCallback(async (force: boolean) => {
    try {
      const [crewsRes, pref] = await Promise.all([
        fetch("/api/crews"),
        fetchPreferences(force),
      ]);
      if (crewsRes.ok) {
        const data = (await crewsRes.json()) as CrewSummary[];
        setCrews(Array.isArray(data) ? data : []);
      }
      if (pref) {
        setActiveCrewIdState(pref.activeCrewId ?? null);
      }
    } catch {
      // schweigen — empty state ist OK
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    void load(false);
  }, [load]);

  const setActiveCrewId = useCallback(
    async (id: string | null) => {
      // Optimistic update
      setActiveCrewIdState(id);
      try {
        await fetch("/api/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activeCrewId: id }),
        });
        window.dispatchEvent(new Event("crew-changed"));
      } catch {
        // Bei Fehler: re-sync
        void refresh();
      }
    },
    [refresh]
  );

  const activeCrew = useMemo(
    () => crews.find((c) => c.id === activeCrewId) ?? null,
    [crews, activeCrewId]
  );

  return (
    <Ctx.Provider
      value={{ crews, activeCrewId, activeCrew, loading, setActiveCrewId, refresh }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCrew() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCrew outside CrewProvider");
  return c;
}
