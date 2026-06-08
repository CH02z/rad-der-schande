# Rad der Schande 🎡

Online Spin-Wheel zum Auslosen unter Freunden — mit Google-Login, echter
Casino-Physik und persistenter Schande-Tabelle (wer wie oft verloren hat).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Auth.js v5 ·
MongoDB Atlas · Mongoose · Tailwind CSS · Framer Motion

---

## ⚡ Quickstart (TL;DR)

```bash
npm install --legacy-peer-deps   # React 19 / next-auth beta — siehe Notes unten
cp .env.example .env.local       # ausfüllen (siehe Schritt 3–5)
npx auth secret                  # schreibt AUTH_SECRET in .env.local
npm run dev                      # → http://localhost:3000
```

---

## 1. Voraussetzungen

- **Node 20+** (`node -v`)
- Ein **MongoDB-Atlas**-Konto (kostenlos)
- Ein **Google-Cloud**-Projekt für OAuth
- Optional: **Vercel**-Konto zum Deployen

## 2. Installation

```bash
npm install --legacy-peer-deps
```

> **Warum `--legacy-peer-deps`?**
> `next-auth@beta` (v5) hat noch keine offizielle React-19-Peer-Range gepinnt.
> Funktioniert tadellos, npm zickt nur beim Resolven. Sobald `next-auth@5`
> stable raus ist, kann der Flag weg.

## 3. MongoDB Atlas einrichten

1. Auf <https://cloud.mongodb.com> einloggen.
2. **Build a Cluster** → kostenloser `M0`-Tier, Region z.B. Frankfurt.
3. **Database Access** → User anlegen (z.B. `schande-app`, Passwort merken).
4. **Network Access** → IP-Adresse `0.0.0.0/0` freigeben (sonst kommt Vercel
   nicht durch — die IPs rotieren).
5. Cluster → **Connect** → **Drivers** → Connection-String kopieren:
   ```
   mongodb+srv://schande-app:<password>@cluster0.xxxxx.mongodb.net/rad-der-schande?retryWrites=true&w=majority
   ```
   - `<password>` ersetzen
   - Den Datenbank-Namen `/rad-der-schande` hinter dem Host hinzufügen (vor `?`)

Du musst keine Collections von Hand anlegen — die werden vom Adapter und von
Mongoose automatisch erstellt.

## 4. Google OAuth einrichten

1. <https://console.cloud.google.com> → neues Projekt
2. **APIs & Services** → **OAuth consent screen** → **External** → ausfüllen
   (Name z.B. „Rad der Schande", Support-Email, etc.)
3. **APIs & Services** → **Credentials** → **Create credentials** →
   **OAuth client ID** → Typ **Web application**
4. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://rad-der-schande.ch/api/auth/callback/google`
5. Client-ID und Client-Secret in `.env.local` setzen.

> **5er-Crew-only?** Im OAuth-Consent-Screen unter „Test users" deine fünf
> Gmail-Adressen eintragen → die App bleibt im „Testing"-Status und niemand
> sonst kann sich anmelden. Wenn du sie in „Production" schaltest, kann sich
> potenziell jeder Google-User einloggen (allerdings sieht er nichts ausser
> dem Rad — kein Datenleak).

## 5. Env-Datei

```bash
cp .env.example .env.local
npx auth secret                  # → schreibt AUTH_SECRET in .env.local
```

Dann von Hand ergänzen:

| Variable             | Wert                                                          |
| -------------------- | ------------------------------------------------------------- |
| `MONGODB_URI`        | Connection-String aus Schritt 3                               |
| `AUTH_SECRET`        | von `npx auth secret` generiert                               |
| `AUTH_GOOGLE_ID`     | Google OAuth Client-ID                                        |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client-Secret                                    |
| `AUTH_TRUST_HOST`    | `true` (für non-Vercel und localhost reicht der Default)      |

## 6. Lokal starten

```bash
npm run dev
# → http://localhost:3000  (leitet auf /login um, bis du angemeldet bist)
```

---

## 🐙 GitHub-Repo initialisieren

Aus dem Projekt-Ordner:

```bash
git init
git add .
git commit -m "init: Rad der Schande"
git branch -M main
git remote add origin https://github.com/CH02z/rad-der-schande.git
git push -u origin main
```

> Zuerst auf <https://github.com/CH02z> ein **neues, leeres Repo**
> namens `rad-der-schande` anlegen (ohne README, ohne .gitignore — wir bringen
> die selbst mit).

## 🚀 Deployment (Vercel + Hostpoint-Domain)

1. <https://vercel.com> → **Add New** → **Project** → GitHub-Repo importieren.
2. **Environment Variables**: alle vier aus `.env.local` eintragen
   (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).
3. **Deploy** drücken — der erste Build erzeugt eine `*.vercel.app`-Domain.
4. **Project Settings → Domains** → `rad-der-schande.ch` hinzufügen. Vercel
   zeigt dir die DNS-Records, die du brauchst (A-Record auf `76.76.21.21`
   und/oder CNAME `cname.vercel-dns.com`).
5. Bei **Hostpoint** im Control-Panel → Domain → DNS-Verwaltung:
   - Den bestehenden A-Record für `@` auf `76.76.21.21` ändern.
   - Für `www` einen CNAME auf `cname.vercel-dns.com` setzen.
6. In Vercel SSL/TLS abwarten (zwei Minuten), fertig.
7. Im Google-Cloud-Console die Redirect-URI für die Prod-Domain nochmal
   überprüfen.

---

## 🧱 Struktur

```
src/
  auth.config.ts        Edge-sichere Auth-Config (Provider, Pages)
  auth.ts               Auth.js + MongoDB-Adapter
  middleware.ts         Schützt alle Routen ausser /login
  lib/
    mongodb.ts          MongoClient (für Auth-Adapter)
    mongoose.ts         Mongoose (für App-Daten)
    audio.ts            WebAudio-Tick + Win-Fanfare
    confetti.ts         CSS-Konfetti-Sprenkler
  models/
    SpinResult.ts       Schema für Spin-Ergebnisse
  components/
    Wheel.tsx           Canvas-Wheel mit echter Physik
    Leaderboard.tsx     Schande-Tabelle
    BrandMark.tsx       SVG-Logo
  app/
    layout.tsx          Root-Layout, Fonts, Metadata
    page.tsx            Geschützte Hauptseite
    login/page.tsx      Google-Login
    api/spins/route.ts  POST = Ergebnis loggen, GET = Tabelle
    api/auth/[...nextauth]/route.ts
    globals.css         Tailwind + Theme
```

## 🎰 Wie funktioniert die Physik?

Das Rad nutzt **keinen** vorberechneten Zielwinkel — es spinnt mit echter
Angular Velocity und realer Reibung:

- Startgeschwindigkeit zufällig zwischen 22 und 34 rad/s (≈ 3.5–5.4 U/s)
- Reibung: `decel = 1.6 + 0.055 · v` rad/s² (Coulomb + viskose Anteile)
- Pro Frame: `v ← v − decel · dt`, `θ ← θ + v · dt` (semi-implizit)
- Stop bei `v ≤ 0.04 rad/s` — Sieger ergibt sich aus der Endposition

Resultat: Rad läuft 6–9 s, kann **überall** zum Stehen kommen — auch knapp
über einer Grenze. Genau wie beim echten Roulette.

Bonus:
- Pointer wackelt bei jedem Segmentwechsel (CSS-Animation)
- WebAudio-Tick pro Segmentgrenze, Volume skaliert mit Velocity
- Win-Fanfare + Konfetti am Ende

## 💡 Nächste Ideen

- Eigene Räume/Gruppen statt globaler Tabelle
- Spin-Historie mit Datum + „wer hat gedreht"
- Verschiedene Modi: „wer fährt", „wer holt Bier", custom Prompt
- Streak-Indikator („Bruno hat 3× in Folge gewonnen")

---

Made with ♥ für die 5er-Gang.
