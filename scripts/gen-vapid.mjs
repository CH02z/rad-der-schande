#!/usr/bin/env node
/**
 * Generiert ein VAPID-Schlüsselpaar für Web-Push und gibt die Werte
 * im .env-Format aus.
 *
 * Aufruf:
 *   npm run gen-vapid
 *
 * Output kopieren in .env.local (und in Vercel-Env-Vars für Production).
 */

import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log("\n=== Web-Push VAPID Keys ===\n");
console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
console.log(`VAPID_SUBJECT=mailto:dein-name@example.com`);
console.log("\nKopiere diese drei Zeilen in deine .env.local\n");
console.log("Wichtig: VAPID_SUBJECT muss eine gültige mailto: URL sein.\n");
