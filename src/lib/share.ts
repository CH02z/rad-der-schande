/**
 * Share-Helpers — Crew-Invite via Web Share / WhatsApp / SMS / Clipboard.
 *
 * Strategie:
 *   1. Native Web Share API (iOS/Android öffnet System-Sheet)
 *   2. Fallback auf Clipboard
 */

interface ShareInput {
  crewName: string;
  code: string;
  /** absolute Origin (z.B. https://rad-der-schande.ch) */
  baseUrl?: string;
}

const APP_NAME = "Rad der Schande";

export function buildInviteUrl(code: string, baseUrl?: string) {
  const base =
    baseUrl ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://rad-der-schande.ch");
  return `${base}/join/${code}`;
}

export function buildInviteText({ crewName, code, baseUrl }: ShareInput) {
  const url = buildInviteUrl(code, baseUrl);
  return `Tritt meiner Crew "${crewName}" beim ${APP_NAME} bei! 🎰\n\nCode: ${code}\n${url}`;
}

export function buildWhatsAppUrl(text: string) {
  // wa.me funktioniert sowohl mobile (WhatsApp-App) als auch Web
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildSmsUrl(text: string) {
  // sms:&body= ist iOS, sms:?body= ist Android — beide akzeptieren das & seit Jahren
  return `sms:?&body=${encodeURIComponent(text)}`;
}

export function buildMailtoUrl(text: string, crewName: string) {
  const subject = encodeURIComponent(`Tritt meiner Crew „${crewName}" bei`);
  return `mailto:?subject=${subject}&body=${encodeURIComponent(text)}`;
}

/**
 * Versucht native Web Share API. Falls nicht verfügbar oder abgebrochen,
 * gibt false zurück — Caller kann dann auf Fallbacks ausweichen.
 */
export async function nativeShare(input: ShareInput): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const text = buildInviteText(input);
  const url = buildInviteUrl(input.code, input.baseUrl);
  try {
    await navigator.share({
      title: APP_NAME,
      text,
      url,
    });
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
