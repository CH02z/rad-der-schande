/**
 * Server-side Web-Push helper. Verwendet web-push mit VAPID-Keys aus den Env-Vars.
 * Wenn keine Keys konfiguriert sind, werden Sends silently übersprungen.
 */
import type { Types } from "mongoose";
import webpush, { type WebPushError } from "web-push";
import PushSubscription, { type PushSubscriptionDoc } from "@/models/PushSubscription";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:noreply@rad-der-schande.ch";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  /** URL nach Klick auf die Notification */
  url?: string;
  /** Group-Tag — neue Notifications mit gleichem Tag ersetzen alte */
  tag?: string;
  icon?: string;
  badge?: string;
}

function isWebPushError(e: unknown): e is WebPushError {
  return typeof e === "object" && e !== null && "statusCode" in e;
}

/**
 * Sendet eine Push-Notification an alle Subscriptions der angegebenen User.
 * Tote Subscriptions (HTTP 410/404) werden automatisch entfernt.
 */
export async function sendPushToUsers(
  userIds: Types.ObjectId[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  if (!ensureConfigured() || userIds.length === 0) {
    return { sent: 0, failed: 0, cleaned: 0 };
  }

  const subs = await PushSubscription.find({ userId: { $in: userIds } }).lean<
    PushSubscriptionDoc[]
  >();

  if (subs.length === 0) return { sent: 0, failed: 0, cleaned: 0 };

  const data = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  let cleaned = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      if (!sub.keys?.p256dh || !sub.keys?.auth) return;
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          data
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        if (isWebPushError(err) && (err.statusCode === 410 || err.statusCode === 404)) {
          try {
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
            cleaned += 1;
          } catch {}
        }
      }
    })
  );

  return { sent, failed, cleaned };
}
