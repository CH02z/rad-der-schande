/**
 * Geteilter Loader für /api/preferences.
 *
 * Vorher fetchten Theme-, Sound-, i18n- und Crew-Context das Endpoint je
 * EINZELN beim Mount → 4 identische Requests + 4 DB-Upserts pro Seitenladen.
 * Hier wird der GET dedupliziert: der erste Aufrufer startet den Request,
 * die übrigen teilen sich dieselbe Promise. Ergebnis wird gecacht.
 *
 * `force = true` erzwingt einen frischen Abruf (z.B. nach einer Mutation).
 */

export interface ServerPreferences {
  theme?: "dark" | "light";
  muted?: boolean;
  locale?: "de" | "en" | "fr" | "es";
  activeCrewId?: string | null;
}

let cache: Promise<ServerPreferences | null> | null = null;

export function fetchPreferences(force = false): Promise<ServerPreferences | null> {
  if (!force && cache) return cache;
  cache = (async () => {
    try {
      const res = await fetch("/api/preferences");
      if (!res.ok) return null;
      return (await res.json()) as ServerPreferences;
    } catch {
      return null;
    }
  })();
  return cache;
}

/** Cache verwerfen (erzwingt beim nächsten fetchPreferences() einen frischen GET). */
export function invalidatePreferences() {
  cache = null;
}
