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

export const APP_VERSION = "1.2.0";

export interface ChangelogEntry {
  version: string;
  date: string; // ISO (YYYY-MM-DD)
  summary: string;
}

/** Neueste Version zuoberst. */
export const CHANGELOG: ChangelogEntry[] = [
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
