# Rad der Schande 🎡

**Edel-Vegas Spin-Wheel für 5er-Crews.** Apple-clean, Casino-physisch, mit
privaten Crews, Schande-Tabelle, Spin-Historie, Stats, Push-Benachrichtigungen
und mehrsprachiger Oberfläche (DE / EN / FR / ES).

> Wer verliert das Glücksrad, trägt die Schande — egal ob „zahlt die Runde"
> oder „macht den Abwasch". Login mit Google, Crew gründen, 6-stelligen Code
> via WhatsApp teilen, drehen, leiden.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Auth.js v5
(Google OAuth) · MongoDB Atlas + Mongoose · Tailwind CSS 3 · Framer Motion ·
Web Push API · PWA-ready

---

## Inhalt

1. [Features](#-features)
2. [Quickstart](#-quickstart)
3. [Setup im Detail](#-setup-im-detail)
4. [Architektur](#-architektur)
5. [Datenmodell](#-datenmodell)
6. [Design-System – „Emerald Salon"](#-design-system--emerald-salon)
7. [Internationalisierung](#-internationalisierung)
8. [Wheel-Physik](#-wheel-physik)
9. [Skripte](#-skripte)
10. [Deployment](#-deployment-vercel--hostpoint)
11. [Rechtliches & Datenschutz](#-rechtliches--datenschutz)
12. [Troubleshooting](#-troubleshooting)
13. [Roadmap](#-roadmap)

---

## ✨ Features

### 🎲 Spin-Mechanik
- Canvas-Rad mit echter **Casino-Physik** (Reibung, kein vorberechneter Sieger)
- **Idle-Rotation** im Ruhezustand (≈ 1 U / 20 s — „das Rad lebt")
- **2 Modi**: *Klassisch* (ein Spin, eine Schande) und *Eliminierung*
  (last man standing)
- Auto-Fit der Namen mit uniformer Schriftgröße + Stroke-Outline
- Mechanische **Tick-Sounds** + Pointer-Wackel bei jedem Segmentwechsel
- **Vegas-Jackpot-Fanfare** (8-Layer Brass + Coin-Shower + Bells + Bass-Drop)
- Fullscreen Winner-Reveal mit 3 Konfetti-Bursts, Pulse-Rings, Screen-Flash
- Zufällige **Konsequenz** im Result-Modal (z.B. „… und zahlt eine Runde")

### 👥 Crew-System
- **Multi-Crew pro User** (Slack-Style Switcher)
- **6-stellige Einladungs-Codes** mit 31-Zeichen-Alphabet (kollisions-sicher)
- Erstellen / Beitreten / Verlassen / Owner-Transfer / Crew löschen
- **Crew-Avatar**: 24 Emojis × 8 Farben mit Live-Preview-Picker
- **Spitznamen** pro Crew (Owner vergibt) — wirken rückwirkend auf alle Spins
- Pro-Crew-Settings: Default-Modus + bis zu 20 Konsequenzen-Vorlagen
- `/join/[CODE]` **Deep-Link** für WhatsApp/iMessage-Einladungen
- Native Share-Sheet (WhatsApp · SMS · E-Mail · Copy · Web-Share)
- **Solo-Modus** (privat, nur eigene Spins)

### 📊 Schande-Tabelle, Verlauf & Stats
- Pro Crew + Solo eigene Tabelle, scoped per `userId`
- Tab-Switcher **Rangliste ↔ Verlauf** (chronologische Liste mit Datum /
  Wer drehte / Wen traf es / Modus)
- Timeline-Filter: Woche / Monat / Jahr / Alltime
- Medaillen 🥇🥈🥉 + Top-Loser-Highlight + Flame-Icon bei Streak
- **Stats-Panel**:
  - Hall of Shame (Top Loser)
  - „Auf der Verliererstrecke" (3+ Streak)
  - **Rivalitäten**: „Bruno verliert 8:3 gegen Lea" mit Bar-Chart
  - Streak-Rekorde
- Owner kann Tabelle leeren (zweistufige Confirmation)

### 🔔 Push-Benachrichtigungen
- **Web Push API** mit VAPID + Service Worker (`public/sw.js`)
- Opt-in via Settings, Status-Banner bei `denied` / `unsupported`
- Sendet bei jedem Crew-Spin an alle anderen Mitglieder:
  „🎰 Saufclique — Bruno hat gedreht, Lea trägt die Schande"
- Tap öffnet die Tabelle direkt
- Auto-Cleanup toter Subscriptions (HTTP 410/404)

### 🌍 Mehrsprachigkeit
- DE / EN / FR / ES mit ~250 Translation-Keys
- Persistenz pro Google-Account in MongoDB
- Browser-Sprache als Default-Detect, Live-Switch in Settings
- Flaggen-Picker auf der Landing

### 🎨 Design – „Emerald Salon"
- **Dark + Light Theme** mit tiefem Smaragd-Felt-Hintergrund, kühlen
  **Graphit-Panels** und **Champagner-Gold**-Trim
- Apple/Revolut-Stil — Graphit-Cards mit Gold-Hairline und Ruby-Akzenten
- Mobile-First Bottom-Tab-Bar (safe-area, 56 px Tap-Targets)
- Desktop Top-Nav mit Crew-Switcher-Pill
- Framer-Motion-Transitions zwischen Views

### 🚪 Public Landing & Rechtsseiten
- Animierter Hero mit rotierendem Gold-Bezel-Rad, schwebenden Casino-Chips
  und Funkeln
- Scroll-Reveal-Feature-Cards, 3-Step-Onboarding, Trust-Band, Doppel-Gold-CTA
- **Cookie-Consent-Banner** (strikt notwendige Cookies, kein Tracking)
- Öffentliche **Impressum** / **Datenschutz** (revDSG / DSGVO) / **AGB** unter
  `/impressum`, `/datenschutz`, `/agb` — DE rechtlich massgeblich, EN als
  Übersetzung (FR/ES → EN-Fallback)
- 🥚 **Easter-Egg „Verbindlichkeitsdekret des Rades"** — augenzwinkernd
  offizielle Erklärung, klickbar im Footer + im Gewinner-Modal

### 🔐 Tech-Foundation
- Next.js App-Router + Server Actions
- Auth.js v5 (JWT-Session + MongoDB-Adapter für Auth-Collection)
- Mongoose-Models mit **ObjectId-FKs** (kein E-Mail-Coupling, name-change-safe)
- Soft-Deletes + Audit-Felder
- Structured-Participants `{userId?, name}` mit Snapshot
- DB-Wipe- und VAPID-Gen-Skripte

---

## ⚡ Quickstart

```bash
npm install --legacy-peer-deps   # React 19 / next-auth-beta → siehe Notes
cp .env.example .env.local       # MongoDB, Google OAuth, VAPID ausfüllen
npx auth secret                  # schreibt AUTH_SECRET in .env.local
npm run gen-vapid                # generiert VAPID-Keys für Web Push
npm run dev                      # → http://localhost:3000
```

---

## 🛠 Setup im Detail

### 1. Voraussetzungen
- **Node 20+** (`node -v`)
- **MongoDB Atlas**-Konto (kostenloser M0-Tier reicht)
- **Google-Cloud**-Projekt für OAuth
- Optional: **Vercel**-Konto zum Deployen

### 2. Installation
```bash
npm install --legacy-peer-deps
```
> **Warum `--legacy-peer-deps`?** `next-auth@beta` (v5) hat noch keine
> offizielle React-19-Peer-Range gepinnt. Funktioniert tadellos, npm zickt
> nur beim Resolven. Sobald v5 stable ist, kann der Flag weg.

### 3. MongoDB Atlas
1. Auf <https://cloud.mongodb.com> einloggen.
2. **Build a Cluster** → `M0` (kostenlos), Region z.B. Frankfurt.
3. **Database Access** → User anlegen (z.B. `schande-app`).
4. **Network Access** → `0.0.0.0/0` freigeben (Vercel-IPs rotieren).
5. **Connect → Drivers** → Connection-String kopieren und in `.env.local`
   einsetzen — Datenbank-Name `/rad-der-schande` vor `?` einfügen:
   ```
   mongodb+srv://schande-app:<password>@cluster0.xxxxx.mongodb.net/rad-der-schande?retryWrites=true&w=majority
   ```

Collections werden automatisch erstellt — Auth.js Adapter (`users`,
`accounts`, `sessions`, `verification_tokens`) und Mongoose (`crews`,
`crewmembers`, `spins`, `userprofiles`, `pushsubscriptions`).

### 4. Google OAuth
1. <https://console.cloud.google.com> → neues Projekt.
2. **OAuth consent screen** → **External** → ausfüllen.
3. **Credentials → Create credentials → OAuth client ID** → *Web application*.
4. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://rad-der-schande.ch/api/auth/callback/google`
5. Client-ID und Secret in `.env.local` setzen.

> **5er-Crew-only?** Im OAuth-Consent-Screen unter „Test users" deine fünf
> Gmail-Adressen eintragen → die App bleibt im *Testing*-Status und niemand
> sonst kann sich anmelden.

### 5. VAPID-Keys für Web Push
```bash
npm run gen-vapid
# Public + Private Key in .env.local übernehmen
# VAPID_SUBJECT auf mailto:deine@adresse.tld setzen
```

### 6. `.env.local`
| Variable             | Wert                                                   |
| -------------------- | ------------------------------------------------------ |
| `MONGODB_URI`        | Connection-String aus Schritt 3                        |
| `AUTH_SECRET`        | via `npx auth secret`                                  |
| `AUTH_GOOGLE_ID`     | Google OAuth Client-ID                                 |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client-Secret                             |
| `AUTH_TRUST_HOST`    | `true` (lokal und Non-Vercel-Hosts)                    |
| `VAPID_PUBLIC_KEY`   | aus `gen-vapid` (im Browser sichtbar, kein Geheimnis)  |
| `VAPID_PRIVATE_KEY`  | aus `gen-vapid` (**niemals committen**)                |
| `VAPID_SUBJECT`      | `mailto:deine@adresse.tld`                             |

### 7. Lokal starten
```bash
npm run dev
# → http://localhost:3000
```

---

## 🏗 Architektur

```
src/
├── auth.config.ts            Edge-sichere Auth-Config (Provider, public Paths)
├── auth.ts                   Auth.js + MongoDB-Adapter, Session-Erweiterungen
├── middleware.ts             Schützt alle Routen ausser /login, /, /join/*, Legal
│
├── app/                      Next.js App-Router
│   ├── layout.tsx            Root-Layout, Fonts (Bricolage + Inter), Theme-Init
│   ├── page.tsx              Landing (öffentlich) ODER Wheel (eingeloggt)
│   ├── globals.css           Tailwind + „Emerald Salon"-Theme-Tokens
│   ├── manifest.ts           PWA-Manifest
│   ├── icon.tsx              Dynamisches PWA-Icon (512 px)
│   ├── apple-icon.tsx        Apple-Touch-Icon (180 px)
│   ├── login/                Google-Login mit Back-Nav
│   ├── tabelle/              Schande-Tabelle (Rangliste ↔ Verlauf-Tabs)
│   ├── crew/                 Crew-Liste + Crew-Detail
│   ├── settings/             User-Settings (Sprache, Theme, Sound, Push, ...)
│   ├── join/[code]/          Deep-Link für Einladungscodes
│   ├── impressum/            öffentlich, Schweizer Impressum
│   ├── datenschutz/          öffentlich, revDSG/DSGVO
│   ├── agb/                  öffentlich, Schweizer AGB
│   └── api/
│       ├── auth/[...nextauth]/   Auth.js Endpoints
│       ├── crews/                CRUD, /[id]/leave, /transfer, /stats, /join
│       ├── crews/[id]/members/[memberId]/   Spitzname, Kick
│       ├── spins/                POST = loggen, GET = aggregierte Rangliste
│       ├── spins/history/        chronologische Spin-Liste
│       ├── preferences/          GET/PUT Sprache, Theme, activeCrewId
│       └── push/                 VAPID-Key, Subscribe, Unsubscribe
│
├── components/
│   ├── Wheel.tsx             Canvas-Rad mit Physik + Setup/Game-Views
│   ├── Leaderboard.tsx       Rangliste pro Crew/Solo + Range-Filter
│   ├── SpinHistory.tsx       Chronologischer Verlauf
│   ├── TabelleTabs.tsx       Tab-Switcher Rangliste ↔ Verlauf
│   ├── StatsPanel.tsx        Hall of Shame, Streaks, Rivalitäten
│   ├── TopNav.tsx            Desktop-Nav inkl. CrewPill
│   ├── BottomNav.tsx         Mobile Tab-Bar
│   ├── CrewPill.tsx          Crew-Switcher-Dropdown (Slack-Style)
│   ├── CrewAvatar.tsx        Emoji+Color-Avatar
│   ├── AvatarPicker.tsx      24 Emojis × 8 Farben Live-Preview
│   ├── Landing.tsx           Public Hero, Features, How-it-works, CTA
│   ├── LegalPage.tsx         Shell für Impressum / Datenschutz / AGB
│   ├── CookieConsent.tsx     Privacy-first Cookie-Banner
│   ├── BindingDecree.tsx     Easter-Egg: Verbindlichkeitsdekret
│   ├── BrandMark.tsx         SVG-Logo (Gold-Ring + Ruby-Hub)
│   └── Providers.tsx         I18n + Theme + Sound + Crew Context
│
├── lib/
│   ├── mongodb.ts            MongoClient (für Auth-Adapter)
│   ├── mongoose.ts           Mongoose-Connection
│   ├── audio.ts              WebAudio: Tick, Jackpot-Fanfare, Spin-Start
│   ├── sound.tsx             Sound-Context (muted-State)
│   ├── confetti.ts           CSS-Konfetti-Sprenkler
│   ├── theme.tsx             Dark/Light-Theme-Context + FOUC-Init-Script
│   ├── i18n.tsx              Locale-Context, dot-notation t() mit Interpolation
│   ├── crew.ts               Crew-Helpers (Code-Gen, isMember, isOwner)
│   ├── crew-context.tsx      Aktive-Crew-State (client-side)
│   ├── display.ts            Name-Resolution (Nickname → Google → E-Mail-Prefix)
│   ├── user.ts               getCurrentUserId() für API-Routes
│   ├── share.ts              Native Web-Share + Fallback-URLs
│   ├── avatars.ts            Emoji- und Farb-Konstanten
│   ├── push.ts               Server-side Web-Push (web-push lib)
│   ├── push-client.ts        Browser-side Subscribe-Helper
│   └── legal-content.ts      Inhalt für Impressum / Datenschutz / AGB
│
├── models/                   Mongoose-Schemata
│   ├── Crew.ts               Crew-Stamm (name, code, emoji, color, owner, ...)
│   ├── CrewMember.ts         Mitgliedschaft + Nickname (mit leftAt)
│   ├── Spin.ts               Spin-Ergebnis mit Loser + Participants-Snapshot
│   ├── UserProfile.ts        Sprache, Theme, activeCrewId pro User
│   └── PushSubscription.ts   Web-Push-Endpoint + Keys pro Gerät
│
├── messages/                 i18n-Übersetzungen
│   ├── de.json   en.json   fr.json   es.json
│
└── types/next-auth.d.ts      Session-Erweiterung (session.user.id)

public/
├── favicon.svg               SVG-Favicon (Gold-Ring + Ruby-Hub)
└── sw.js                     Service Worker für Web Push

scripts/
├── gen-vapid.mjs             Generiert VAPID-Keys → in .env.local
├── wipe-db.mjs               Wipe der App-Collections (mit Bestätigung)
└── patch-i18n.mjs            Bulk-Add neuer Translation-Keys (Deep-Merge)
```

---

## 🗄 Datenmodell

Alle Models nutzen **ObjectId-Foreign-Keys** statt E-Mails — damit bleibt
alles stabil, auch wenn User ihren Google-Namen oder die E-Mail-Adresse
ändern. Spins speichern zusätzlich einen **Namens-Snapshot**, damit alte
Tabellen lesbar bleiben, wenn jemand die Crew verlässt.

| Model              | Wichtigste Felder                                                           |
| ------------------ | --------------------------------------------------------------------------- |
| `Crew`             | `name`, `code` (6-stellig, eindeutig), `emoji`, `accentColor`, `ownerId`, `defaultMode`, `consequences[]`, `deletedAt` |
| `CrewMember`       | `crewId`, `userId`, `nickname?`, `joinedAt`, `leftAt?`                       |
| `Spin`             | `crewId?`, `spunByUserId`, `loser:{userId?,name}`, `participants:[{userId?,name}]`, `mode`, `createdAt` |
| `UserProfile`      | `userId`, `locale`, `theme`, `activeCrewId?`, Push-Opt-in                    |
| `PushSubscription` | `userId`, `endpoint`, `keys.p256dh`, `keys.auth`, `createdAt`                |

### Spin-Scope
- `crewId === null` → **Solo-Spin**, nur für den ausführenden User sichtbar.
- `crewId !== null` → **Crew-Spin**, sichtbar für alle aktiven Mitglieder.

### Indexe
- `Spin`: `{crewId, createdAt:-1}` (Crew-Leaderboard) und `{spunByUserId, crewId, createdAt:-1}` (Solo)
- `Crew`: `code` unique
- `CrewMember`: `{crewId, userId}` unique

---

## 🎨 Design-System – „Emerald Salon"

Edles Las-Vegas-Theme: sattes **Smaragd-Felt** als Stage, kühle
**Graphit-Panels** und **Champagner-Gold**-Trim.

| Token                   | Rolle                                                  |
| ----------------------- | ------------------------------------------------------ |
| `--bg` / `--felt-*`     | Smaragd-Spieltisch-Hintergrund mit Vignette + Spotlight |
| `--panel-top/bottom`    | Graphit-Slab für alle Panels                           |
| `--surface*`            | Dezente Glas-Surfaces für Chips/Inputs                 |
| `--text-gold`           | Champagner-Gold für Akzente                            |
| `--border-gold*`        | Feiner Gold-Trim                                       |

**Wichtig:** Alle Panel-Treatments (`.card-casino`, `.glass`, `.glass-strong`)
zeigen denselben Graphit-Slab — Low-Opacity-Surfaces direkt überm Grün würden
grünlich durchscheinen. Wer das Look-and-Feel ändern will, editiert in
**`src/app/globals.css`** die `:root`-Tokens — die ganze App folgt
automatisch.

Theme-Toggle: Dark (Default) ↔ Light. Persistenz pro User in MongoDB +
FOUC-freier Inline-Script-Init in `src/lib/theme.tsx`.

---

## 🌐 Internationalisierung

- 4 Sprachen: **DE / EN / FR / ES**, ~250 Keys pro Datei.
- `t("a.b.c", {var})` mit `{var}`-Interpolation, dot-notation, Fallback auf DE.
- Persistenz pro Account (`/api/preferences`), Browser-Sprache als Initial-Hint.

### Neue Keys batch-weise hinzufügen
Statt 4 JSON-Dateien manuell zu editieren:
```bash
# scripts/patch-i18n.mjs verwenden — Deep-Merge,
# erhält bestehende Keys + Reihenfolge.
node scripts/patch-i18n.mjs
```
Backtick-Strings nutzen — typografische `"`/`'` brechen sonst den Parser.

---

## 🎰 Wheel-Physik

Das Rad nutzt **keinen** vorberechneten Zielwinkel — es spinnt mit echter
Angular Velocity und realer Reibung:

- Startgeschwindigkeit zufällig zwischen 26 und 36 rad/s
- Reibung: `decel = 1.0 + 0.20 · v` rad/s² (Coulomb + viskose Anteile)
- Pro Frame: `v ← v − decel · dt`, `θ ← θ + v · dt` (semi-implizit)
- Stop bei `v ≤ 0.05 rad/s` — Sieger ergibt sich aus der Endposition

**Resultat:** Lauf 6–9 s, kann überall stoppen — auch knapp über einer
Segmentgrenze. Genau wie beim echten Roulette.

Bonus:
- Pointer wackelt bei jedem Segmentwechsel (Web-Animations-API)
- WebAudio-Tick pro Segmentgrenze, Volume skaliert mit Velocity
- 8-Layer Jackpot-Fanfare + Konfetti + Screen-Flash am Ende
- **Idle-Modus**: `IDLE_VELOCITY = 0.32 rad/s` — das Rad bewegt sich
  permanent leicht ⇒ wirkt „lebendig"

---

## 🧰 Skripte

| Script                | Zweck                                                  |
| --------------------- | ------------------------------------------------------ |
| `npm run dev`         | Dev-Server auf <http://localhost:3000>                 |
| `npm run build`       | Production-Build                                       |
| `npm run start`       | Production-Server                                      |
| `npm run lint`        | ESLint                                                 |
| `npm run gen-vapid`   | Generiert VAPID-Keys → in `.env.local` einsetzen       |
| `npm run db:wipe`     | Löscht alle App-Collections (mit Confirmation, USE WITH CARE) |
| `node scripts/patch-i18n.mjs` | Deep-Merge-Patch für alle 4 i18n-Dateien        |

---

## 🚀 Deployment (Vercel + Hostpoint)

1. <https://vercel.com> → **Add New** → **Project** → GitHub-Repo importieren.
2. **Environment Variables**: alle aus `.env.local` eintragen
   (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`).
3. **Deploy** — erster Build erzeugt eine `*.vercel.app`-Domain.
4. **Project Settings → Domains** → `rad-der-schande.ch` hinzufügen. Vercel
   nennt die nötigen DNS-Records (A → `76.76.21.21`, optional CNAME `www → cname.vercel-dns.com`).
5. Bei **Hostpoint** → Domain → DNS-Verwaltung:
   - A-Record für `@` auf `76.76.21.21`
   - CNAME `www` auf `cname.vercel-dns.com`
6. SSL/TLS-Bereitstellung von Vercel abwarten (≈ 2 min), fertig.
7. **Google Cloud Console**: Prod-Redirect-URI nochmal verifizieren
   (`https://rad-der-schande.ch/api/auth/callback/google`).

### PWA / Web Push auf iOS
Web Push funktioniert auf iPhone nur in einer **installierten PWA**
(„Zum Home-Bildschirm"), nicht im normalen Safari-Tab. Das Manifest +
Apple-Touch-Icon sind dafür bereits eingerichtet.

---

## ⚖️ Rechtliches & Datenschutz

Öffentliche Rechtsseiten sind unter `/impressum`, `/datenschutz`, `/agb`
erreichbar — in `src/auth.config.ts` als public registriert.

- **Massgeblich ist die deutsche Fassung** (`src/lib/legal-content.ts`,
  Map `DE`). EN ist Service-Übersetzung, FR/ES fallen auf EN zurück.
- Datenschutz folgt **revDSG** (Schweiz) und – soweit anwendbar – **DSGVO**.
- Hinweis zum **EDÖB** als Aufsichtsbehörde ist integriert.
- **Nur essenzielle Cookies** (Auth.js Session) + `localStorage` für
  Preferences. Kein Tracking, kein Profiling, keine Werbung — und der
  Cookie-Consent-Banner sagt das auch genau so.

### ⚠️ Platzhalter im Rechtstext
Vor dem Live-Gang in `src/lib/legal-content.ts` ersetzen:
- `[Name des Betreibers]`
- `[Strasse Nr.]`
- `[PLZ Ort]`

Kontakt-E-Mail (`czi.swiss@gmail.com`) ist bereits gesetzt.

### Easter-Egg
Das **„Verbindlichkeitsdekret des Rades"** (`BindingDecree.tsx`) ist
augenzwinkernd gemeint und entfaltet keinerlei Rechtswirkung — das ist auch
in den AGB Ziff. 5 ausdrücklich festgehalten.

---

## 🛟 Troubleshooting

| Symptom                                    | Lösung                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `npm install` schlägt mit Peer-Konflikt fehl | `--legacy-peer-deps` nutzen                                            |
| „MongoServerError: bad auth" beim Start    | Connection-String prüfen, `<password>` ersetzt? IP-Allowlist `0.0.0.0/0`? |
| Login-Loop „NEXTAUTH_URL"                  | `AUTH_TRUST_HOST=true` in `.env.local`, oder `AUTH_URL` setzen          |
| Push-Subscribe wirft 500                   | `gen-vapid` ausgeführt? Alle drei VAPID-Vars gesetzt?                  |
| iPhone bekommt keine Push                  | App per „Zum Home-Bildschirm" installieren — Safari-Tab geht nicht     |
| Rad startet nicht beim Klick               | Browser-Audio-Autoplay-Policy — erster User-Click entsperrt WebAudio   |

---

## 🗺 Roadmap

- [ ] Tages-Gruppierung im Verlauf („Heute / Gestern / …")
- [ ] Spin-Replay-Animation aus Historie
- [ ] CSV-Export der Schande-Tabelle
- [ ] Crew-Wallpapers / Themes pro Crew
- [ ] Spin-Wagers („Doppelt-oder-nichts")
- [ ] FR/ES vollständige Rechtstext-Übersetzung statt EN-Fallback

---

Made with ♥ und Smaragd-Glanz für 5er-Crews. 🎰
