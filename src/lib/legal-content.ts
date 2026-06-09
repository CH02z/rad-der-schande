/**
 * Rechtstexte für «Rad der Schande» — Impressum, Datenschutz (revDSG/DSGVO),
 * AGB. Rechtlich massgebend ist die deutsche Fassung; EN ist eine
 * Service-Übersetzung. FR/ES fallen auf EN zurück.
 *
 * ⚠️ PLATZHALTER: [Name des Betreibers], [Strasse Nr.], [PLZ Ort] müssen vom
 * Betreiber mit den realen Angaben ersetzt werden. Kontakt-E-Mail ist gesetzt.
 *
 * Alle Werte stehen in Backticks → Anführungszeichen im Text sind unkritisch.
 */

export type LegalDoc = "impressum" | "datenschutz" | "agb";

export interface LegalSection {
  h?: string;
  p: string[];
}
export interface LegalContent {
  title: string;
  intro?: string;
  sections: LegalSection[];
}

const CONTACT_EMAIL = "czi.swiss@gmail.com";
const SITE = "rad-der-schande.ch";

/* ============================================================ DE ========= */

const DE: Record<LegalDoc, LegalContent> = {
  impressum: {
    title: `Impressum`,
    intro: `Angaben gemäss Art. 3 Abs. 1 lit. s UWG.`,
    sections: [
      {
        h: `Betreiber`,
        p: [`Chris Zimmermann`, `Obstgartenstrasse 26`, `8136 Gattikon, Schweiz`],
      },
      { h: `Kontakt`, p: [`E-Mail: ${CONTACT_EMAIL}`, `Web: ${SITE}`] },
      { h: `Vertretungsberechtigte Person`, p: [`Chris Zimmermann`] },
      {
        h: `Haftungsausschluss`,
        p: [
          `Die Inhalte dieser Anwendung wurden mit grösstmöglicher Sorgfalt erstellt. Der Betreiber übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte.`,
          `«Rad der Schande» ist ein kostenloses Unterhaltungs-Tool. Der Zufallsgenerator (das «Rad») dient ausschliesslich dem Spass; aus seinen Ergebnissen entstehen keinerlei rechtlich durchsetzbare Ansprüche zwischen den Teilnehmenden.`,
          `Haftungsansprüche gegen den Betreiber wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der Anwendung entstehen, sind ausgeschlossen, soweit gesetzlich zulässig.`,
        ],
      },
      {
        h: `Haftung für Links`,
        p: [
          `Diese Anwendung kann Verweise auf Websites Dritter enthalten (z.B. Google-Login). Auf deren Inhalte hat der Betreiber keinen Einfluss und übernimmt dafür keine Haftung. Für den Inhalt verlinkter Seiten ist stets der jeweilige Anbieter verantwortlich.`,
        ],
      },
      {
        h: `Urheberrecht`,
        p: [
          `Die durch den Betreiber erstellten Inhalte und Werke unterliegen dem schweizerischen Urheberrecht. Vervielfältigung, Bearbeitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des Betreibers.`,
        ],
      },
    ],
  },

  datenschutz: {
    title: `Datenschutzerklärung`,
    intro: `Diese Erklärung informiert über die Bearbeitung von Personendaten im Sinne des revidierten Schweizer Datenschutzgesetzes (revDSG) und – soweit anwendbar – der EU-Datenschutz-Grundverordnung (DSGVO).`,
    sections: [
      {
        h: `1. Verantwortliche Stelle`,
        p: [
          `Verantwortlich für die Datenbearbeitung ist:`,
          `Chris Zimmermann, Obstgartenstrasse 26, 8136 Gattikon, Schweiz.`,
          `Kontakt in Datenschutzfragen: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        h: `2. Welche Daten wir bearbeiten`,
        p: [
          `Anmeldedaten (Google-Login): Name, E-Mail-Adresse und Profilbild deines Google-Kontos. Wir erhalten kein Passwort.`,
          `Nutzungsdaten: von dir erstellte oder beigetretene Crews, Einladungscodes, Spitznamen sowie die protokollierten Dreh-Ergebnisse (Spins) inklusive Teilnehmer, Verlierer, Modus und Zeitstempel.`,
          `Geräte-/Push-Daten: bei aktivierten Benachrichtigungen eine Push-Subscription deines Browsers (Endpoint und Schlüssel).`,
          `Einstellungen: Sprache und Theme (hell/dunkel), gespeichert pro Konto sowie lokal in deinem Browser.`,
        ],
      },
      {
        h: `3. Zwecke und Rechtsgrundlagen`,
        p: [
          `Die Bearbeitung erfolgt, um dir den Dienst bereitzustellen (Login, Crews, Schande-Tabelle, Statistiken), um Push-Benachrichtigungen zu versenden und um deine Einstellungen zu speichern.`,
          `Rechtsgrundlage ist die Erfüllung bzw. Bereitstellung des von dir genutzten Dienstes sowie dein Einverständnis (z.B. für Push-Benachrichtigungen), das du jederzeit widerrufen kannst.`,
        ],
      },
      {
        h: `4. Cookies und lokale Speicherung`,
        p: [
          `Wir verwenden ausschliesslich technisch notwendige Cookies, um deine Login-Sitzung aufrechtzuerhalten (Session-Cookie von Auth.js). Diese sind für den Betrieb erforderlich.`,
          `Zusätzlich speichern wir Einstellungen (Sprache, Theme, aktive Crew, Cookie-Hinweis) lokal in deinem Browser (localStorage). Es findet kein Tracking, kein Profiling und keine Werbung statt.`,
        ],
      },
      {
        h: `5. Hosting und Auftragsbearbeiter`,
        p: [
          `Die Anwendung wird bei Vercel Inc. (USA) gehostet. Dabei können technisch notwendige Server-Logs (z.B. IP-Adresse, Zeitpunkt, Browsertyp) anfallen.`,
          `Daten werden in einer MongoDB-Datenbank (MongoDB Atlas) gespeichert. Die Authentifizierung erfolgt über Google (Google Ireland Ltd. / Google LLC).`,
          `Bei Übermittlungen in Länder ohne gleichwertiges Datenschutzniveau stützen wir uns auf geeignete Garantien (z.B. Standardvertragsklauseln).`,
        ],
      },
      {
        h: `6. Weitergabe an Dritte`,
        p: [
          `Wir verkaufen deine Daten nicht und geben sie nicht zu Werbezwecken weiter. Eine Bekanntgabe erfolgt nur an die oben genannten Auftragsbearbeiter, soweit für den Betrieb erforderlich, oder wenn wir gesetzlich dazu verpflichtet sind.`,
          `Innerhalb einer Crew sind deine angezeigten Spin-Ergebnisse und dein (Spitz-)Name für die übrigen aktiven Mitglieder dieser Crew sichtbar.`,
        ],
      },
      {
        h: `7. Aufbewahrung und Löschung`,
        p: [
          `Wir bewahren Daten nur so lange auf, wie es für die genannten Zwecke erforderlich ist. Du kannst Crews verlassen, Tabellen leeren (sofern berechtigt) und Push-Benachrichtigungen deaktivieren.`,
          `Auf Anfrage an ${CONTACT_EMAIL} löschen wir dein Konto und die damit verbundenen Daten.`,
        ],
      },
      {
        h: `8. Deine Rechte`,
        p: [
          `Du hast das Recht auf Auskunft, Berichtigung, Löschung und Herausgabe deiner Daten sowie auf Widerspruch gegen bestimmte Bearbeitungen. Wende dich dafür an die oben genannte Kontaktadresse.`,
          `Du hast zudem das Recht, dich beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) zu beschweren.`,
        ],
      },
      {
        h: `9. Änderungen`,
        p: [
          `Wir können diese Datenschutzerklärung anpassen. Es gilt jeweils die auf dieser Seite veröffentlichte Fassung.`,
        ],
      },
    ],
  },

  agb: {
    title: `Allgemeine Geschäftsbedingungen (Nutzungsbedingungen)`,
    intro: `Diese Nutzungsbedingungen regeln die Nutzung der Anwendung «Rad der Schande» (nachfolgend «Dienst»).`,
    sections: [
      {
        h: `1. Geltungsbereich`,
        p: [
          `Mit der Nutzung des Dienstes akzeptierst du diese Bedingungen. Gelten sie nicht für dich, nutze den Dienst bitte nicht.`,
        ],
      },
      {
        h: `2. Beschreibung des Dienstes`,
        p: [
          `Der Dienst ist ein kostenloses, werbefreies Unterhaltungs-Tool. Ein virtuelles Glücksrad bestimmt nach dem Zufallsprinzip eine Person aus einer Gruppe (wer trägt die Schande). Nutzer können private Crews bilden, Ergebnisse in einer gemeinsamen Tabelle festhalten und Statistiken ansehen.`,
        ],
      },
      {
        h: `3. Konto und Registrierung`,
        p: [
          `Die Nutzung erfordert eine Anmeldung über ein Google-Konto. Du bist für die Geheimhaltung deiner Zugangsdaten und für Aktivitäten unter deinem Konto verantwortlich.`,
        ],
      },
      {
        h: `4. Verhaltensregeln`,
        p: [
          `Du verpflichtest dich, den Dienst nicht missbräuchlich zu nutzen, keine rechtswidrigen, beleidigenden oder rechtsverletzenden Inhalte (z.B. als Namen oder Spitznamen) einzugeben und die Rechte Dritter zu wahren.`,
          `Der Betreiber kann Inhalte entfernen oder Konten sperren, die gegen diese Regeln verstossen.`,
        ],
      },
      {
        h: `5. Kein rechtsverbindliches Ergebnis`,
        p: [
          `Das Rad ist ein reiner Zufallsgenerator zu Unterhaltungszwecken. Ergebnisse begründen keine rechtlich durchsetzbaren Verpflichtungen zwischen den Teilnehmenden. Was ihr untereinander daraus macht, ist allein eure freiwillige Sache.`,
          `Allfällige «verbindliche Erklärungen» innerhalb des Dienstes sind augenzwinkernd gemeint und entfalten keine Rechtswirkung.`,
        ],
      },
      {
        h: `6. Verfügbarkeit und Gewährleistung`,
        p: [
          `Der Dienst wird ohne jede Gewähr und im Ist-Zustand bereitgestellt. Es besteht kein Anspruch auf ununterbrochene Verfügbarkeit, fehlerfreien Betrieb oder dauerhafte Speicherung von Daten.`,
        ],
      },
      {
        h: `7. Haftung`,
        p: [
          `Soweit gesetzlich zulässig, ist die Haftung des Betreibers für Schäden aus der Nutzung oder Nichtnutzung des Dienstes ausgeschlossen. Unberührt bleibt die Haftung für Vorsatz und grobe Fahrlässigkeit.`,
        ],
      },
      {
        h: `8. Beendigung`,
        p: [
          `Du kannst die Nutzung jederzeit beenden, Crews verlassen oder die Löschung deines Kontos verlangen. Der Betreiber kann den Dienst jederzeit ganz oder teilweise einstellen.`,
        ],
      },
      {
        h: `9. Anwendbares Recht und Gerichtsstand`,
        p: [
          `Es gilt ausschliesslich schweizerisches Recht unter Ausschluss des Kollisionsrechts. Ausschliesslicher Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz des Betreibers in der Schweiz.`,
        ],
      },
      {
        h: `10. Schlussbestimmungen`,
        p: [
          `Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Der Betreiber kann diese Bedingungen anpassen; es gilt die jeweils veröffentlichte Fassung.`,
        ],
      },
    ],
  },
};

/* ============================================================ EN ========= */

const EN: Record<LegalDoc, LegalContent> = {
  impressum: {
    title: `Legal Notice (Impressum)`,
    intro: `Information pursuant to Art. 3 para. 1 lit. s of the Swiss UCA.`,
    sections: [
      {
        h: `Operator`,
        p: [`[Operator name]`, `[Street No.]`, `[Postal code City], Switzerland`],
      },
      { h: `Contact`, p: [`E-mail: ${CONTACT_EMAIL}`, `Web: ${SITE}`] },
      { h: `Authorised representative`, p: [`[Operator name]`] },
      {
        h: `Disclaimer`,
        p: [
          `The contents of this application have been compiled with the greatest possible care. However, the operator assumes no liability for the accuracy, completeness or timeliness of the content provided.`,
          `«Rad der Schande» is a free entertainment tool. The random generator (the wheel) serves fun purposes only; its results do not create any legally enforceable claims between participants.`,
          `Liability claims against the operator for damages of a material or immaterial nature arising from access to or use (or non-use) of the application are excluded as far as legally permissible.`,
        ],
      },
      {
        h: `Liability for links`,
        p: [
          `This application may contain references to third-party websites (e.g. Google login). The operator has no influence over their content and accepts no liability for it. The respective provider is always responsible for the content of linked pages.`,
        ],
      },
      {
        h: `Copyright`,
        p: [
          `The content and works created by the operator are subject to Swiss copyright law. Reproduction, editing and any kind of exploitation outside the limits of copyright require the operator's written consent.`,
        ],
      },
    ],
  },
  datenschutz: {
    title: `Privacy Policy`,
    intro: `This policy explains how personal data is processed under the revised Swiss Data Protection Act (revFADP) and – where applicable – the EU General Data Protection Regulation (GDPR).`,
    sections: [
      {
        h: `1. Controller`,
        p: [
          `The controller responsible for data processing is:`,
          `[Operator name], [Street No.], [Postal code City], Switzerland.`,
          `Privacy contact: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        h: `2. Data we process`,
        p: [
          `Sign-in data (Google login): the name, e-mail address and profile picture of your Google account. We never receive a password.`,
          `Usage data: crews you create or join, invite codes, nicknames, and the logged spin results including participants, loser, mode and timestamp.`,
          `Device/push data: if you enable notifications, a push subscription from your browser (endpoint and keys).`,
          `Settings: language and theme (light/dark), stored per account and locally in your browser.`,
        ],
      },
      {
        h: `3. Purposes and legal bases`,
        p: [
          `Processing is carried out to provide the service (login, crews, shame table, statistics), to send push notifications and to store your settings.`,
          `The legal basis is the performance of the service you use as well as your consent (e.g. for push notifications), which you may withdraw at any time.`,
        ],
      },
      {
        h: `4. Cookies and local storage`,
        p: [
          `We use strictly necessary cookies only, to maintain your login session (Auth.js session cookie). These are required for operation.`,
          `We additionally store settings (language, theme, active crew, cookie notice) locally in your browser (localStorage). There is no tracking, profiling or advertising.`,
        ],
      },
      {
        h: `5. Hosting and processors`,
        p: [
          `The application is hosted by Vercel Inc. (USA). Technically necessary server logs (e.g. IP address, time, browser type) may be generated.`,
          `Data is stored in a MongoDB database (MongoDB Atlas). Authentication is handled by Google (Google Ireland Ltd. / Google LLC).`,
          `For transfers to countries without an adequate level of protection, we rely on appropriate safeguards (e.g. standard contractual clauses).`,
        ],
      },
      {
        h: `6. Disclosure to third parties`,
        p: [
          `We do not sell your data and do not share it for advertising. Disclosure occurs only to the processors named above, as required for operation, or where we are legally obliged to do so.`,
          `Within a crew, your displayed spin results and your (nick)name are visible to the other active members of that crew.`,
        ],
      },
      {
        h: `7. Retention and deletion`,
        p: [
          `We retain data only as long as necessary for the stated purposes. You can leave crews, clear tables (if authorised) and disable push notifications.`,
          `On request to ${CONTACT_EMAIL}, we will delete your account and associated data.`,
        ],
      },
      {
        h: `8. Your rights`,
        p: [
          `You have the right to access, rectification, deletion and data portability, as well as to object to certain processing. Please contact the address above.`,
          `You also have the right to lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC).`,
        ],
      },
      {
        h: `9. Changes`,
        p: [
          `We may amend this privacy policy. The version published on this page applies.`,
        ],
      },
    ],
  },
  agb: {
    title: `Terms of Use`,
    intro: `These terms govern the use of the application «Rad der Schande» (the «Service»).`,
    sections: [
      {
        h: `1. Scope`,
        p: [
          `By using the Service you accept these terms. If they do not apply to you, please do not use the Service.`,
        ],
      },
      {
        h: `2. Description of the Service`,
        p: [
          `The Service is a free, ad-free entertainment tool. A virtual wheel of fortune randomly selects one person from a group (who carries the shame). Users can form private crews, record results in a shared table and view statistics.`,
        ],
      },
      {
        h: `3. Account and registration`,
        p: [
          `Use requires signing in with a Google account. You are responsible for keeping your credentials confidential and for activity under your account.`,
        ],
      },
      {
        h: `4. Rules of conduct`,
        p: [
          `You undertake not to misuse the Service, not to enter unlawful, offensive or infringing content (e.g. as names or nicknames) and to respect the rights of others.`,
          `The operator may remove content or suspend accounts that violate these rules.`,
        ],
      },
      {
        h: `5. No legally binding outcome`,
        p: [
          `The wheel is a pure random generator for entertainment purposes. Results do not create any legally enforceable obligations between participants. Whatever you make of it among yourselves is entirely voluntary.`,
          `Any «binding declarations» within the Service are tongue-in-cheek and have no legal effect.`,
        ],
      },
      {
        h: `6. Availability and warranty`,
        p: [
          `The Service is provided as is and without any warranty. There is no right to uninterrupted availability, error-free operation or permanent storage of data.`,
        ],
      },
      {
        h: `7. Liability`,
        p: [
          `To the extent permitted by law, the operator's liability for damages arising from the use or non-use of the Service is excluded. Liability for intent and gross negligence remains unaffected.`,
        ],
      },
      {
        h: `8. Termination`,
        p: [
          `You may stop using the Service at any time, leave crews or request deletion of your account. The operator may discontinue the Service in whole or in part at any time.`,
        ],
      },
      {
        h: `9. Governing law and jurisdiction`,
        p: [
          `Swiss law applies exclusively, excluding conflict-of-law rules. The exclusive place of jurisdiction is – as far as legally permissible – the operator's registered seat in Switzerland.`,
        ],
      },
      {
        h: `10. Final provisions`,
        p: [
          `Should individual provisions be invalid, the validity of the remaining provisions remains unaffected. The operator may amend these terms; the version published at the time applies.`,
        ],
      },
    ],
  },
};

export const LEGAL_CONTENT = { de: DE, en: EN } as const;

/** Wählt die Inhaltssprache: DE für locale 'de', sonst EN (FR/ES → EN). */
export function getLegalContent(locale: string, doc: LegalDoc): LegalContent {
  return locale === "de" ? DE[doc] : EN[doc];
}

/** Massgeblichkeits-Hinweis nur anzeigen, wenn nicht-deutsche Fassung gezeigt wird. */
export function isAuthoritative(locale: string): boolean {
  return locale === "de";
}
