/**
 * Zentrale App-Version — Single Source of Truth.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  PFLEGE-KONVENTION (gilt auch für den Assistenten/Claude):
 *  Bei jeder nennenswerten Änderung VOR dem Commit:
 *    1. `APP_VERSION` nach SemVer anheben:
 *         · PATCH (x.y.Z) → Bugfix, kleine Politur
 *         · MINOR (x.Y.0) → neues Feature, abwärtskompatibel
 *         · MAJOR (X.0.0) → grosser Umbau / Breaking Change
 *    2. Oben in CHANGELOG einen Eintrag ergänzen (neueste zuerst).
 *    3. `version` in package.json synchron halten.
 * ───────────────────────────────────────────────────────────────────────────
 */

export const APP_VERSION = "1.3.0";

export interface ChangelogEntry {
  version: string;
  date: string; // ISO (YYYY-MM-DD)
  summary: string;
}

/** Neueste Version zuoberst. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-06-16",
    summary:
      "Hand-Spin: Das Rad lässt sich jetzt mit Maus/Finger anstossen und schleudern — natürliche Roulette-Physik in beide Richtungen, voll auf Mobile optimiert. Casino-Hintergrundmusik im Spielmodus plus lautere, markantere Peg-Ticks. Gewinner-Screen: «Jackpot» → «Gewinner» und sauber zentriert auf Mobile (kein schräges/abgeschnittenes Overlay mehr). Rechtstexte (Impressum/Datenschutz/AGB) samt Betreiberangaben jetzt vollständig in DE/EN/FR/ES.",
  },
  {
    version: "1.2.2",
    date: "2026-06-10",
    summary:
      "Fixes: Zurück-Button bricht jetzt auch einen laufenden Spin ab. Beitritt via Join-Link führt nach dem Login wirklich in die Crew (callbackUrl). Wording neutralisiert — das Rad entscheidet generisch über die Schande, nicht präjudiziert auf «zahlen».",
  },
  {
    version: "1.2.1",
    date: "2026-06-10",
    summary:
      "Fix: BottomNav (Mobile) erscheint nur noch für eingeloggte User — ausgeloggt auf Landing/Legal ist die Navbar komplett weg (Auth-Status server-seitig im Layout bestimmt).",
  },
  {
    version: "1.2.0",
    date: "2026-06-10",
    summary:
      "Mobile: Crew/Solo-Switcher (CrewPill) oben rechts statt Profilbild — man sieht direkt, wo man ist (Solo oder welche Crew). Im Solo-Modus zeigt der Pill das eigene Profilbild.",
  },
  {
    version: "1.1.0",
    date: "2026-06-10",
    summary:
      "Performance: Serverless-Functions nach Frankfurt (fra1), Mongoose-Connection-Tuning, /api/preferences von 4× auf 1× dedupliziert, Namens-Auflösung parallelisiert. Vercel Analytics & Speed Insights. Diskrete Versionsanzeige.",
  },
  {
    version: "1.0.0",
    date: "2026-06-09",
    summary:
      "Erstes öffentliches Release auf rad-der-schande.ch: Emerald-Salon-Redesign, Multi-Crew-System, Schande-Tabelle, Spin-Historie, Stats, Web-Push, i18n (DE/EN/FR/ES), Rechtsseiten (Impressum/Datenschutz/AGB), Cookie-Consent, Easter-Egg.",
  },
];
