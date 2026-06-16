/**
 * Rechtstexte für «Rad der Schande» — Impressum, Datenschutz (revDSG/DSGVO),
 * AGB. Rechtlich massgebend ist die deutsche Fassung; EN/FR/ES sind
 * Service-Übersetzungen mit denselben (realen) Betreiberangaben.
 *
 * Betreiberangaben sind in allen Sprachen gesetzt (Chris Zimmermann,
 * Obstgartenstrasse 26, 8136 Gattikon, Schweiz; Kontakt: czi.swiss@gmail.com).
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
        p: [`Chris Zimmermann`, `Obstgartenstrasse 26`, `8136 Gattikon, Switzerland`],
      },
      { h: `Contact`, p: [`E-mail: ${CONTACT_EMAIL}`, `Web: ${SITE}`] },
      { h: `Authorised representative`, p: [`Chris Zimmermann`] },
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
          `Chris Zimmermann, Obstgartenstrasse 26, 8136 Gattikon, Switzerland.`,
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

/* ============================================================ FR ========= */

const FR: Record<LegalDoc, LegalContent> = {
  impressum: {
    title: `Mentions légales (Impressum)`,
    intro: `Informations selon l'art. 3 al. 1 let. s LCD (loi suisse contre la concurrence déloyale).`,
    sections: [
      {
        h: `Exploitant`,
        p: [`Chris Zimmermann`, `Obstgartenstrasse 26`, `8136 Gattikon, Suisse`],
      },
      { h: `Contact`, p: [`E-mail: ${CONTACT_EMAIL}`, `Web: ${SITE}`] },
      { h: `Personne autorisée à représenter`, p: [`Chris Zimmermann`] },
      {
        h: `Clause de non-responsabilité`,
        p: [
          `Les contenus de cette application ont été élaborés avec le plus grand soin. L'exploitant n'assume toutefois aucune garantie quant à l'exactitude, l'exhaustivité et l'actualité des contenus fournis.`,
          `«Rad der Schande» est un outil de divertissement gratuit. Le générateur aléatoire (la roue) sert uniquement au divertissement; ses résultats ne créent aucune prétention juridiquement exécutoire entre les participants.`,
          `Les prétentions en responsabilité à l'encontre de l'exploitant pour des dommages de nature matérielle ou immatérielle résultant de l'accès à l'application ou de son utilisation (ou non-utilisation) sont exclues dans la mesure permise par la loi.`,
        ],
      },
      {
        h: `Responsabilité pour les liens`,
        p: [
          `Cette application peut contenir des renvois vers des sites de tiers (p. ex. la connexion Google). L'exploitant n'a aucune influence sur leur contenu et n'en assume aucune responsabilité. Le fournisseur respectif est toujours responsable du contenu des pages liées.`,
        ],
      },
      {
        h: `Droit d'auteur`,
        p: [
          `Les contenus et œuvres créés par l'exploitant sont soumis au droit d'auteur suisse. La reproduction, l'édition et toute forme d'exploitation en dehors des limites du droit d'auteur requièrent le consentement écrit de l'exploitant.`,
        ],
      },
    ],
  },
  datenschutz: {
    title: `Politique de confidentialité`,
    intro: `Cette déclaration informe sur le traitement des données personnelles au sens de la nouvelle loi fédérale suisse sur la protection des données (nLPD) et – dans la mesure applicable – du règlement général de l'UE sur la protection des données (RGPD).`,
    sections: [
      {
        h: `1. Responsable du traitement`,
        p: [
          `Le responsable du traitement des données est:`,
          `Chris Zimmermann, Obstgartenstrasse 26, 8136 Gattikon, Suisse.`,
          `Contact pour les questions de protection des données: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        h: `2. Quelles données nous traitons`,
        p: [
          `Données de connexion (login Google): nom, adresse e-mail et photo de profil de votre compte Google. Nous ne recevons aucun mot de passe.`,
          `Données d'utilisation: les crews que vous créez ou rejoignez, les codes d'invitation, les surnoms ainsi que les résultats de tirage enregistrés (spins), y compris les participants, le perdant, le mode et l'horodatage.`,
          `Données d'appareil/push: si les notifications sont activées, un abonnement push de votre navigateur (endpoint et clés).`,
          `Réglages: langue et thème (clair/sombre), enregistrés par compte ainsi que localement dans votre navigateur.`,
        ],
      },
      {
        h: `3. Finalités et bases légales`,
        p: [
          `Le traitement est effectué pour vous fournir le service (connexion, crews, tableau de la honte, statistiques), pour envoyer des notifications push et pour enregistrer vos réglages.`,
          `La base légale est l'exécution ou la fourniture du service que vous utilisez ainsi que votre consentement (p. ex. pour les notifications push), que vous pouvez révoquer à tout moment.`,
        ],
      },
      {
        h: `4. Cookies et stockage local`,
        p: [
          `Nous utilisons exclusivement des cookies techniquement nécessaires pour maintenir votre session de connexion (cookie de session d'Auth.js). Ils sont indispensables au fonctionnement.`,
          `Nous enregistrons en outre des réglages (langue, thème, crew active, avis sur les cookies) localement dans votre navigateur (localStorage). Il n'y a ni suivi, ni profilage, ni publicité.`,
        ],
      },
      {
        h: `5. Hébergement et sous-traitants`,
        p: [
          `L'application est hébergée chez Vercel Inc. (États-Unis). Des journaux de serveur techniquement nécessaires (p. ex. adresse IP, horodatage, type de navigateur) peuvent être générés.`,
          `Les données sont stockées dans une base de données MongoDB (MongoDB Atlas). L'authentification est assurée par Google (Google Ireland Ltd. / Google LLC).`,
          `Pour les transferts vers des pays n'offrant pas un niveau de protection équivalent, nous nous appuyons sur des garanties appropriées (p. ex. clauses contractuelles types).`,
        ],
      },
      {
        h: `6. Transmission à des tiers`,
        p: [
          `Nous ne vendons pas vos données et ne les transmettons pas à des fins publicitaires. Une communication n'a lieu qu'aux sous-traitants mentionnés ci-dessus, dans la mesure nécessaire à l'exploitation, ou lorsque nous y sommes légalement tenus.`,
          `Au sein d'une crew, vos résultats de tirage affichés et votre (sur)nom sont visibles pour les autres membres actifs de cette crew.`,
        ],
      },
      {
        h: `7. Conservation et suppression`,
        p: [
          `Nous ne conservons les données que le temps nécessaire aux finalités indiquées. Vous pouvez quitter des crews, vider des tableaux (si vous y êtes autorisé) et désactiver les notifications push.`,
          `Sur demande à ${CONTACT_EMAIL}, nous supprimons votre compte et les données associées.`,
        ],
      },
      {
        h: `8. Vos droits`,
        p: [
          `Vous avez le droit d'accès, de rectification, de suppression et de remise de vos données, ainsi que le droit de vous opposer à certains traitements. Adressez-vous pour cela à l'adresse de contact indiquée ci-dessus.`,
          `Vous avez en outre le droit de déposer une réclamation auprès du Préposé fédéral à la protection des données et à la transparence (PFPDT).`,
        ],
      },
      {
        h: `9. Modifications`,
        p: [
          `Nous pouvons adapter cette politique de confidentialité. La version publiée sur cette page fait foi.`,
        ],
      },
    ],
  },
  agb: {
    title: `Conditions d'utilisation`,
    intro: `Ces conditions d'utilisation régissent l'utilisation de l'application «Rad der Schande» (ci-après le «Service»).`,
    sections: [
      {
        h: `1. Champ d'application`,
        p: [
          `En utilisant le Service, vous acceptez ces conditions. Si elles ne s'appliquent pas à vous, veuillez ne pas utiliser le Service.`,
        ],
      },
      {
        h: `2. Description du Service`,
        p: [
          `Le Service est un outil de divertissement gratuit et sans publicité. Une roue de la fortune virtuelle désigne aléatoirement une personne au sein d'un groupe (qui porte la honte). Les utilisateurs peuvent former des crews privées, consigner les résultats dans un tableau commun et consulter des statistiques.`,
        ],
      },
      {
        h: `3. Compte et inscription`,
        p: [
          `L'utilisation nécessite une connexion via un compte Google. Vous êtes responsable de la confidentialité de vos identifiants et des activités effectuées sous votre compte.`,
        ],
      },
      {
        h: `4. Règles de conduite`,
        p: [
          `Vous vous engagez à ne pas utiliser le Service de manière abusive, à ne pas saisir de contenus illicites, injurieux ou portant atteinte aux droits de tiers (p. ex. comme noms ou surnoms) et à respecter les droits des tiers.`,
          `L'exploitant peut supprimer des contenus ou bloquer des comptes qui enfreignent ces règles.`,
        ],
      },
      {
        h: `5. Aucun résultat juridiquement contraignant`,
        p: [
          `La roue est un pur générateur aléatoire à des fins de divertissement. Les résultats ne créent aucune obligation juridiquement exécutoire entre les participants. Ce que vous en faites entre vous relève uniquement de votre libre arbitre.`,
          `Les éventuelles «déclarations contraignantes» au sein du Service sont à prendre au second degré et n'ont aucun effet juridique.`,
        ],
      },
      {
        h: `6. Disponibilité et garantie`,
        p: [
          `Le Service est fourni en l'état et sans aucune garantie. Il n'existe aucun droit à une disponibilité ininterrompue, à un fonctionnement sans erreur ou à une conservation permanente des données.`,
        ],
      },
      {
        h: `7. Responsabilité`,
        p: [
          `Dans la mesure permise par la loi, la responsabilité de l'exploitant pour les dommages résultant de l'utilisation ou de la non-utilisation du Service est exclue. La responsabilité pour faute intentionnelle et négligence grave demeure réservée.`,
        ],
      },
      {
        h: `8. Résiliation`,
        p: [
          `Vous pouvez cesser d'utiliser le Service à tout moment, quitter des crews ou demander la suppression de votre compte. L'exploitant peut interrompre le Service en tout ou en partie à tout moment.`,
        ],
      },
      {
        h: `9. Droit applicable et for`,
        p: [
          `Le droit suisse s'applique exclusivement, à l'exclusion des règles de conflit de lois. Le for exclusif est – dans la mesure permise par la loi – le siège de l'exploitant en Suisse.`,
        ],
      },
      {
        h: `10. Dispositions finales`,
        p: [
          `Si certaines dispositions devaient être invalides, la validité des autres dispositions n'en serait pas affectée. L'exploitant peut adapter ces conditions; la version publiée à un moment donné fait foi.`,
        ],
      },
    ],
  },
};

/* ============================================================ ES ========= */

const ES: Record<LegalDoc, LegalContent> = {
  impressum: {
    title: `Aviso legal (Impressum)`,
    intro: `Información según el art. 3 párr. 1 let. s de la Ley suiza contra la competencia desleal (LCD).`,
    sections: [
      {
        h: `Operador`,
        p: [`Chris Zimmermann`, `Obstgartenstrasse 26`, `8136 Gattikon, Suiza`],
      },
      { h: `Contacto`, p: [`Correo electrónico: ${CONTACT_EMAIL}`, `Web: ${SITE}`] },
      { h: `Persona autorizada para representar`, p: [`Chris Zimmermann`] },
      {
        h: `Descargo de responsabilidad`,
        p: [
          `Los contenidos de esta aplicación se han elaborado con el mayor cuidado posible. No obstante, el operador no asume ninguna garantía sobre la exactitud, integridad y actualidad de los contenidos facilitados.`,
          `«Rad der Schande» es una herramienta de entretenimiento gratuita. El generador aleatorio (la rueda) sirve exclusivamente para el entretenimiento; sus resultados no generan ninguna pretensión jurídicamente exigible entre los participantes.`,
          `Quedan excluidas, en la medida en que lo permita la ley, las reclamaciones de responsabilidad contra el operador por daños de naturaleza material o inmaterial derivados del acceso a la aplicación o de su uso (o no uso).`,
        ],
      },
      {
        h: `Responsabilidad por enlaces`,
        p: [
          `Esta aplicación puede contener referencias a sitios web de terceros (p. ej. el inicio de sesión con Google). El operador no tiene influencia sobre su contenido y no asume ninguna responsabilidad por él. El respectivo proveedor es siempre responsable del contenido de las páginas enlazadas.`,
        ],
      },
      {
        h: `Derechos de autor`,
        p: [
          `Los contenidos y obras creados por el operador están sujetos a la legislación suiza sobre derechos de autor. La reproducción, edición y cualquier tipo de explotación fuera de los límites de los derechos de autor requieren el consentimiento por escrito del operador.`,
        ],
      },
    ],
  },
  datenschutz: {
    title: `Política de privacidad`,
    intro: `Esta declaración informa sobre el tratamiento de datos personales en el sentido de la nueva Ley federal suiza de protección de datos (nLPD) y, en la medida aplicable, del Reglamento general de protección de datos de la UE (RGPD).`,
    sections: [
      {
        h: `1. Responsable del tratamiento`,
        p: [
          `El responsable del tratamiento de los datos es:`,
          `Chris Zimmermann, Obstgartenstrasse 26, 8136 Gattikon, Suiza.`,
          `Contacto para cuestiones de protección de datos: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        h: `2. Qué datos tratamos`,
        p: [
          `Datos de inicio de sesión (login de Google): nombre, dirección de correo electrónico y foto de perfil de tu cuenta de Google. No recibimos ninguna contraseña.`,
          `Datos de uso: las crews que creas o a las que te unes, los códigos de invitación, los apodos, así como los resultados de giro registrados (spins), incluidos los participantes, el perdedor, el modo y la marca de tiempo.`,
          `Datos de dispositivo/push: si activas las notificaciones, una suscripción push de tu navegador (endpoint y claves).`,
          `Ajustes: idioma y tema (claro/oscuro), almacenados por cuenta y localmente en tu navegador.`,
        ],
      },
      {
        h: `3. Finalidades y bases jurídicas`,
        p: [
          `El tratamiento se realiza para prestarte el servicio (inicio de sesión, crews, tabla de la vergüenza, estadísticas), para enviar notificaciones push y para guardar tus ajustes.`,
          `La base jurídica es la ejecución o prestación del servicio que utilizas, así como tu consentimiento (p. ej. para las notificaciones push), que puedes revocar en cualquier momento.`,
        ],
      },
      {
        h: `4. Cookies y almacenamiento local`,
        p: [
          `Utilizamos exclusivamente cookies técnicamente necesarias para mantener tu sesión de inicio de sesión (cookie de sesión de Auth.js). Son necesarias para el funcionamiento.`,
          `Además, almacenamos ajustes (idioma, tema, crew activa, aviso de cookies) localmente en tu navegador (localStorage). No hay seguimiento, ni elaboración de perfiles, ni publicidad.`,
        ],
      },
      {
        h: `5. Alojamiento y encargados del tratamiento`,
        p: [
          `La aplicación está alojada en Vercel Inc. (EE. UU.). En este proceso pueden generarse registros de servidor técnicamente necesarios (p. ej. dirección IP, hora, tipo de navegador).`,
          `Los datos se almacenan en una base de datos MongoDB (MongoDB Atlas). La autenticación se realiza a través de Google (Google Ireland Ltd. / Google LLC).`,
          `Para las transferencias a países sin un nivel de protección equivalente, nos basamos en garantías adecuadas (p. ej. cláusulas contractuales tipo).`,
        ],
      },
      {
        h: `6. Comunicación a terceros`,
        p: [
          `No vendemos tus datos ni los compartimos con fines publicitarios. Solo se comunican a los encargados del tratamiento mencionados anteriormente, en la medida necesaria para el funcionamiento, o cuando estamos legalmente obligados a ello.`,
          `Dentro de una crew, tus resultados de giro mostrados y tu nombre (o apodo) son visibles para los demás miembros activos de esa crew.`,
        ],
      },
      {
        h: `7. Conservación y supresión`,
        p: [
          `Conservamos los datos solo durante el tiempo necesario para las finalidades indicadas. Puedes abandonar crews, vaciar tablas (si estás autorizado) y desactivar las notificaciones push.`,
          `Previa solicitud a ${CONTACT_EMAIL}, eliminaremos tu cuenta y los datos asociados.`,
        ],
      },
      {
        h: `8. Tus derechos`,
        p: [
          `Tienes derecho de acceso, rectificación, supresión y portabilidad de tus datos, así como a oponerte a determinados tratamientos. Para ello, dirígete a la dirección de contacto indicada anteriormente.`,
          `Además, tienes derecho a presentar una reclamación ante el Encargado Federal de Protección de Datos y Transparencia de Suiza (EDÖB).`,
        ],
      },
      {
        h: `9. Cambios`,
        p: [
          `Podemos modificar esta política de privacidad. Rige la versión publicada en esta página.`,
        ],
      },
    ],
  },
  agb: {
    title: `Condiciones de uso`,
    intro: `Estas condiciones de uso regulan el uso de la aplicación «Rad der Schande» (en adelante, el «Servicio»).`,
    sections: [
      {
        h: `1. Ámbito de aplicación`,
        p: [
          `Al utilizar el Servicio, aceptas estas condiciones. Si no se aplican a ti, por favor no utilices el Servicio.`,
        ],
      },
      {
        h: `2. Descripción del Servicio`,
        p: [
          `El Servicio es una herramienta de entretenimiento gratuita y sin publicidad. Una rueda de la fortuna virtual selecciona aleatoriamente a una persona de un grupo (quién carga con la vergüenza). Los usuarios pueden formar crews privadas, registrar los resultados en una tabla compartida y consultar estadísticas.`,
        ],
      },
      {
        h: `3. Cuenta y registro`,
        p: [
          `El uso requiere iniciar sesión con una cuenta de Google. Eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta.`,
        ],
      },
      {
        h: `4. Normas de conducta`,
        p: [
          `Te comprometes a no utilizar el Servicio de forma abusiva, a no introducir contenidos ilícitos, ofensivos o que infrinjan derechos de terceros (p. ej. como nombres o apodos) y a respetar los derechos de terceros.`,
          `El operador puede eliminar contenidos o bloquear cuentas que infrinjan estas normas.`,
        ],
      },
      {
        h: `5. Ningún resultado jurídicamente vinculante`,
        p: [
          `La rueda es un mero generador aleatorio con fines de entretenimiento. Los resultados no generan ninguna obligación jurídicamente exigible entre los participantes. Lo que hagáis con ello entre vosotros es asunto exclusivamente vuestro y voluntario.`,
          `Las posibles «declaraciones vinculantes» dentro del Servicio se entienden con humor y no tienen ningún efecto jurídico.`,
        ],
      },
      {
        h: `6. Disponibilidad y garantía`,
        p: [
          `El Servicio se presta tal cual y sin garantía alguna. No existe derecho a una disponibilidad ininterrumpida, a un funcionamiento sin errores ni al almacenamiento permanente de los datos.`,
        ],
      },
      {
        h: `7. Responsabilidad`,
        p: [
          `En la medida en que lo permita la ley, queda excluida la responsabilidad del operador por daños derivados del uso o no uso del Servicio. No se ve afectada la responsabilidad por dolo y negligencia grave.`,
        ],
      },
      {
        h: `8. Terminación`,
        p: [
          `Puedes dejar de usar el Servicio en cualquier momento, abandonar crews o solicitar la supresión de tu cuenta. El operador puede suspender el Servicio total o parcialmente en cualquier momento.`,
        ],
      },
      {
        h: `9. Derecho aplicable y jurisdicción`,
        p: [
          `Se aplica exclusivamente el derecho suizo, con exclusión de las normas de conflicto de leyes. El fuero exclusivo es —en la medida en que lo permita la ley— la sede del operador en Suiza.`,
        ],
      },
      {
        h: `10. Disposiciones finales`,
        p: [
          `Si alguna disposición fuera inválida, la validez de las demás disposiciones no se verá afectada. El operador puede modificar estas condiciones; rige la versión publicada en cada momento.`,
        ],
      },
    ],
  },
};

export const LEGAL_CONTENT = { de: DE, en: EN, fr: FR, es: ES } as const;

/** Wählt die Inhaltssprache pro Locale. DE ist rechtlich massgebend, die übrigen
 *  Sprachen sind Service-Übersetzungen mit denselben Betreiberangaben. */
export function getLegalContent(locale: string, doc: LegalDoc): LegalContent {
  const byLocale: Record<string, Record<LegalDoc, LegalContent>> = { de: DE, en: EN, fr: FR, es: ES };
  return (byLocale[locale] ?? EN)[doc];
}

/** Massgeblichkeits-Hinweis nur anzeigen, wenn nicht-deutsche Fassung gezeigt wird. */
export function isAuthoritative(locale: string): boolean {
  return locale === "de";
}
