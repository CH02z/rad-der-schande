#!/usr/bin/env node
/**
 * Dropt ALLE Collections in der per MONGODB_URI angegebenen Datenbank.
 *
 * Aufruf:
 *   npm run db:wipe
 *
 * Lädt automatisch .env.local via Node's --env-file Flag (Node 20+).
 * Schutz: schreibt nichts ohne explizite Bestätigung via CONFIRM=yes.
 */

import { MongoClient } from "mongodb";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✗ MONGODB_URI fehlt. Lege .env.local mit MONGODB_URI=… an.");
  process.exit(1);
}

const dbNameMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
const dbName = dbNameMatch?.[1] ?? "(default)";

console.log(`\n  Cluster:  ${uri.replace(/\/\/[^@]+@/, "//***:***@")}`);
console.log(`  Datenbank: ${dbName}\n`);

if (process.env.CONFIRM !== "yes") {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(
    `  Wirklich alle Collections in '${dbName}' löschen? (yes/no): `
  );
  rl.close();
  if (answer.toLowerCase() !== "yes") {
    console.log("Abgebrochen.");
    process.exit(0);
  }
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db();
const cols = await db.listCollections().toArray();

if (cols.length === 0) {
  console.log("  Keine Collections gefunden — nichts zu tun.");
} else {
  console.log(`  ${cols.length} Collections gefunden:`);
  for (const c of cols) console.log(`    · ${c.name}`);
  console.log();
  for (const c of cols) {
    try {
      await db.collection(c.name).drop();
      console.log(`  ✓ dropped: ${c.name}`);
    } catch (e) {
      console.log(`  ✗ ${c.name}: ${e.message}`);
    }
  }
}

await client.close();
console.log("\n  Fertig.\n");
