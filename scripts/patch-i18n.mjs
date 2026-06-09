import { readFileSync, writeFileSync } from "node:fs";

const FILE = (l) => new URL(`../src/messages/${l}.json`, import.meta.url);

// Alle Werte in Backticks → '/" im Text sind unkritisch.
const ADD = {
  de: {
    login: { back: `Zur Startseite` },
    tabelle: {
      tabs: { ranking: `Rangliste`, history: `Verlauf` },
      history: {
        empty: `Noch keine Drehungen in diesem Zeitraum.`,
        bears: `trägt die Schande`,
        spunBy: `gedreht von {name}`,
      },
    },
    legal: {
      eyebrow: `Rechtliches`,
      back: `Zurück`,
      updated: `Zuletzt aktualisiert`,
      authoritative: `Massgebend ist die deutsche Fassung; dies ist eine Übersetzung.`,
      nav: { impressum: `Impressum`, privacy: `Datenschutz`, terms: `AGB` },
      cookies: {
        title: `Cookies & Privatsphäre`,
        text: `Wir nutzen nur technisch notwendige Cookies für deinen Login und speichern Einstellungen lokal. Kein Tracking, keine Werbung.`,
        accept: `Alles klar`,
        essential: `Nur Notwendige`,
        more: `Mehr erfahren`,
      },
      decree: {
        trigger: `§ Verbindlich & rechtskräftig`,
        eyebrow: `Hohe Drehkammer`,
        title: `Verbindlichkeitserklärung des Rades`,
        intro: `Hiermit wird mit sofortiger Wirkung und unter Ausschluss des Rechtswegs festgehalten:`,
        p1: `Wer vom Rad der Schande erwählt wird, ist unwiderruflich, vollumfänglich und auf ewig verpflichtet, der getroffenen Abmachung Folge zu leisten — sei es die Runde zu zahlen, den Abwasch zu erledigen oder die Schande in Würde zu tragen.`,
        p2: `Sollte das Rad ausnahmsweise für etwas anderes als das Zahlen einer Runde bemüht werden, gilt: Die erwählte Person zahlt trotzdem. Sicherheitshalber. Das Rad irrt nie.`,
        p3: `Ausreden, Einsprüche, Berufungen, Rekurse sowie das Vorbringen von «aber ich hatte schon letztes Mal» werden vom Hohen Rat des Rades mit einem milden Lächeln und einer weiteren Runde quittiert.`,
        p4: `Die Schwerkraft, der Zufall und die Physik haben entschieden. Gegen Naturgesetze ist kein Kraut gewachsen — gegen das Rad erst recht nicht.`,
        p5: `Mit dem Druck auf «Drehen» erkennt jede teilnehmende Person diese Erklärung als bindend, heilig und absolut an. Zeugen sind sämtliche Anwesenden sowie mindestens ein:e Barkeeper:in.`,
        fineprint: `Hinweis für Spielverderber: In der echten Welt ist das natürlich nur ein Spass (siehe AGB, Ziffer 5). Aber psst.`,
        sign: `Im Namen des Rades · Die Hohe Drehkammer`,
        close: `Ich füge mich dem Rad`,
      },
    },
  },

  en: {
    login: { back: `Back to home` },
    tabelle: {
      tabs: { ranking: `Ranking`, history: `History` },
      history: {
        empty: `No spins in this period yet.`,
        bears: `carries the shame`,
        spunBy: `spun by {name}`,
      },
    },
    legal: {
      eyebrow: `Legal`,
      back: `Back`,
      updated: `Last updated`,
      authoritative: `The German version is authoritative; this is a translation.`,
      nav: { impressum: `Legal notice`, privacy: `Privacy`, terms: `Terms` },
      cookies: {
        title: `Cookies & privacy`,
        text: `We use only strictly necessary cookies for your login and store settings locally. No tracking, no ads.`,
        accept: `Got it`,
        essential: `Necessary only`,
        more: `Learn more`,
      },
      decree: {
        trigger: `§ Binding & enforceable`,
        eyebrow: `High Spinning Chamber`,
        title: `Binding Decree of the Wheel`,
        intro: `Be it hereby known, with immediate effect and excluding all legal recourse:`,
        p1: `Whosoever is chosen by the Wheel of Shame is irrevocably, fully and eternally obliged to honour the agreed deal — be it buying the round, doing the dishes, or carrying the shame with dignity.`,
        p2: `Should the Wheel ever be summoned for anything other than buying a round, the following applies: the chosen one pays anyway. Just to be safe. The Wheel is never wrong.`,
        p3: `Excuses, objections, appeals, motions and the plea of «but I had it last time» shall be answered by the High Council of the Wheel with a gentle smile and one more round.`,
        p4: `Gravity, chance and physics have spoken. There is no remedy against the laws of nature — and even less against the Wheel.`,
        p5: `By pressing «Spin», every participant acknowledges this declaration as binding, sacred and absolute. Witnesses are all those present and at least one bartender.`,
        fineprint: `Note for party-poopers: in the real world this is, of course, just for fun (see Terms, clause 5). But shhh.`,
        sign: `In the name of the Wheel · The High Spinning Chamber`,
        close: `I submit to the Wheel`,
      },
    },
  },

  fr: {
    login: { back: `Accueil` },
    tabelle: {
      tabs: { ranking: `Classement`, history: `Historique` },
      history: {
        empty: `Aucun tirage sur cette période.`,
        bears: `porte la honte`,
        spunBy: `lancé par {name}`,
      },
    },
    legal: {
      eyebrow: `Mentions légales`,
      back: `Retour`,
      updated: `Dernière mise à jour`,
      authoritative: `La version allemande fait foi ; ceci est une traduction.`,
      nav: { impressum: `Mentions légales`, privacy: `Confidentialité`, terms: `CGU` },
      cookies: {
        title: `Cookies & confidentialité`,
        text: `Nous utilisons uniquement des cookies strictement nécessaires à ta connexion et stockons les réglages localement. Pas de pistage, pas de publicité.`,
        accept: `D'accord`,
        essential: `Nécessaires uniquement`,
        more: `En savoir plus`,
      },
      decree: {
        trigger: `§ Contraignant & exécutoire`,
        eyebrow: `Haute Chambre Tournante`,
        title: `Déclaration contraignante de la Roue`,
        intro: `Il est par la présente établi, avec effet immédiat et à l'exclusion de toute voie de droit :`,
        p1: `Quiconque est désigné par la Roue de la Honte est irrévocablement, intégralement et éternellement tenu d'honorer l'accord conclu — payer la tournée, faire la vaisselle ou porter la honte avec dignité.`,
        p2: `Si la Roue venait à être invoquée pour autre chose que payer une tournée, la règle suivante s'applique : l'élu·e paie quand même. Par précaution. La Roue ne se trompe jamais.`,
        p3: `Excuses, objections, recours et le fameux « mais c'était déjà moi la dernière fois » seront accueillis par le Haut Conseil de la Roue d'un doux sourire et d'une tournée supplémentaire.`,
        p4: `La gravité, le hasard et la physique ont tranché. On ne lutte pas contre les lois de la nature — et encore moins contre la Roue.`,
        p5: `En appuyant sur « Tourner », chaque participant·e reconnaît cette déclaration comme contraignante, sacrée et absolue. Les témoins sont toutes les personnes présentes ainsi qu'au moins un·e barman·aid.`,
        fineprint: `Note pour les rabat-joie : dans le monde réel, ceci n'est bien sûr qu'une plaisanterie (voir CGU, point 5). Mais chut.`,
        sign: `Au nom de la Roue · La Haute Chambre Tournante`,
        close: `Je me soumets à la Roue`,
      },
    },
  },

  es: {
    login: { back: `Inicio` },
    tabelle: {
      tabs: { ranking: `Clasificación`, history: `Historial` },
      history: {
        empty: `Aún no hay tiradas en este periodo.`,
        bears: `carga con la vergüenza`,
        spunBy: `girada por {name}`,
      },
    },
    legal: {
      eyebrow: `Legal`,
      back: `Volver`,
      updated: `Última actualización`,
      authoritative: `La versión en alemán es la vinculante; esto es una traducción.`,
      nav: { impressum: `Aviso legal`, privacy: `Privacidad`, terms: `Términos` },
      cookies: {
        title: `Cookies y privacidad`,
        text: `Solo usamos cookies estrictamente necesarias para tu inicio de sesión y guardamos los ajustes localmente. Sin rastreo ni publicidad.`,
        accept: `Entendido`,
        essential: `Solo necesarias`,
        more: `Saber más`,
      },
      decree: {
        trigger: `§ Vinculante y ejecutable`,
        eyebrow: `Alta Cámara Giratoria`,
        title: `Declaración vinculante de la Rueda`,
        intro: `Por la presente se establece, con efecto inmediato y excluyendo toda vía legal:`,
        p1: `Quien sea elegido por la Rueda de la Vergüenza queda irrevocable, íntegra y eternamente obligado a cumplir el acuerdo pactado: pagar la ronda, fregar los platos o llevar la vergüenza con dignidad.`,
        p2: `Si la Rueda llegara a usarse para algo distinto de pagar una ronda, se aplica lo siguiente: el elegido paga igualmente. Por si acaso. La Rueda nunca se equivoca.`,
        p3: `Excusas, objeciones, recursos y el clásico «pero si ya me tocó la última vez» serán respondidos por el Alto Consejo de la Rueda con una suave sonrisa y otra ronda más.`,
        p4: `La gravedad, el azar y la física han hablado. No hay remedio contra las leyes de la naturaleza, y mucho menos contra la Rueda.`,
        p5: `Al pulsar «Girar», cada participante reconoce esta declaración como vinculante, sagrada y absoluta. Son testigos todos los presentes y al menos un camarero.`,
        fineprint: `Nota para aguafiestas: en el mundo real esto es, por supuesto, solo una broma (véanse los Términos, cláusula 5). Pero shhh.`,
        sign: `En nombre de la Rueda · La Alta Cámara Giratoria`,
        close: `Me someto a la Rueda`,
      },
    },
  },
};

function merge(target, src) {
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      merge(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

for (const locale of Object.keys(ADD)) {
  const path = FILE(locale);
  const obj = JSON.parse(readFileSync(path, "utf8"));
  merge(obj, ADD[locale]);
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n");
  console.log("patched", locale);
}
