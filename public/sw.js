// Rad der Schande — Service Worker für Web-Push Notifications
// Reagiert auf push-Events und Notification-Klicks.

self.addEventListener("install", () => {
  // Sofort aktiv ohne auf Refresh zu warten
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Rad der Schande", body: event.data.text() };
  }

  const title = payload.title || "Rad der Schande";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/favicon.svg",
    badge: payload.badge || "/favicon.svg",
    data: { url: payload.url || "/" },
    tag: payload.tag || undefined,
    renotify: !!payload.tag,
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        try {
          const url = new URL(client.url);
          if (url.pathname === targetUrl || client.url.endsWith(targetUrl)) {
            return client.focus();
          }
        } catch {}
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});
