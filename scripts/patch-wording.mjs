import { readFileSync, writeFileSync } from "node:fs";

const FILE = (l) => new URL(`../src/messages/${l}.json`, import.meta.url);

// Generisches Wording: das Rad entscheidet nur über die Schande — nicht
// präjudiziert auf „zahlen". Es kann für alles verwendet werden.
const PATCH = {
  de: {
    "landing.features.subtitle":
      "Casino-Physik, Crew-System, Stats. Damit eure 5er-Crew endlich gerecht entscheiden kann, wer die Schande trägt.",
    "crew.detail.consequencePlaceholder": "z.B. Abwasch, Liegestütze, nächste Runde …",
  },
  en: {
    "landing.features.subtitle":
      "Casino physics, crew system, stats. Everything your 5-person crew needs to finally settle, once and for all, who carries the shame.",
    "crew.detail.consequencePlaceholder": "e.g. dishes, push-ups, next round …",
  },
  fr: {
    "landing.features.subtitle":
      "Physique de casino, système d'équipe, statistiques. Tout pour que votre bande de 5 décide enfin qui porte la honte.",
    "crew.detail.consequencePlaceholder": "ex. vaisselle, pompes, prochaine tournée …",
  },
  es: {
    "landing.features.subtitle":
      "Física de casino, sistema de crew, estadísticas. Todo para que tu grupo de 5 decida por fin quién carga con la vergüenza.",
    "crew.detail.consequencePlaceholder": "ej. fregar, flexiones, próxima ronda …",
  },
};

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof cur[keys[i]] !== "object" || cur[keys[i]] === null) {
      throw new Error(`Pfad fehlt: ${path}`);
    }
    cur = cur[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (!(last in cur)) throw new Error(`Key fehlt: ${path}`);
  cur[last] = value;
}

for (const locale of Object.keys(PATCH)) {
  const path = FILE(locale);
  const obj = JSON.parse(readFileSync(path, "utf8"));
  for (const [k, v] of Object.entries(PATCH[locale])) setPath(obj, k, v);
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n");
  console.log("patched", locale);
}
