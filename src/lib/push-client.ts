"use client";

/**
 * Client-side Push-Helpers: Service Worker registrieren, abonnieren/abmelden,
 * Permission-Status auslesen.
 */

const SW_PATH = "/sw.js";

export type PushStatus =
  | "granted"
  | "denied"
  | "default"
  | "unsupported"
  | "unsubscribed";

function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (existing) return existing;
    return await navigator.serviceWorker.register(SW_PATH);
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToB64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";
  // granted — check if a subscription exists
  const reg = await getRegistration();
  if (!reg) return "default";
  const sub = await reg.pushManager.getSubscription();
  return sub ? "granted" : "unsubscribed";
}

export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const reg = await getRegistration();
  if (!reg) return false;

  if (Notification.permission !== "granted") {
    const result = await Notification.requestPermission();
    if (result !== "granted") return false;
  }

  // VAPID-Public-Key vom Server holen
  const keyRes = await fetch("/api/push/key");
  if (!keyRes.ok) return false;
  const { key } = (await keyRes.json()) as { key: string };
  if (!key) return false;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    // Cast nötig: TS unterscheidet zwischen Uint8Array<ArrayBuffer> und <SharedArrayBuffer>
    applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: bufToB64(subscription.getKey("p256dh")),
        auth: bufToB64(subscription.getKey("auth")),
      },
      userAgent: navigator.userAgent,
    }),
  });

  return true;
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await getRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;
  try {
    await sub.unsubscribe();
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {}
  return true;
}
