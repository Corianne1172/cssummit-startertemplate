#!/usr/bin/env node
// Resets the fake demo profiles in the Supabase `Connect` table.
// Deletes the existing profile rows, then inserts the ones from lib/profiles.ts.
// Add --matches to also clear recorded matches. Never prints a key.
// Run: pnpm seed

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File not there: fine.
  }
}

const { publicEnv, serverEnv } = await import("../lib/env.ts");
const { SEED_PROFILES } = await import("../lib/profiles.ts");

const url = publicEnv.supabaseUrl;
const key = serverEnv().supabaseSecretKey;
if (!url || !key) {
  console.log("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY is not set.");
  process.exit(1);
}

async function call(method, query, body) {
  const response = await fetch(`${url}/rest/v1/Connect${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) {
    console.log(
      `${method} failed: HTTP ${response.status} ${text.slice(0, 200)}`,
    );
    if (text.includes("data"))
      console.log(
        'Hint: run this in the Supabase SQL Editor first:\n  alter table "Connect" add column data jsonb;',
      );
    process.exit(1);
  }
  return JSON.parse(text || "[]");
}

const kinds = process.argv.includes("--matches")
  ? ["profile", "match"]
  : ["profile"];
for (const kind of kinds) {
  const removed = await call("DELETE", `?data->>kind=eq.${kind}`);
  console.log(`removed ${removed.length} ${kind} rows`);
}
const added = await call(
  "POST",
  "",
  SEED_PROFILES.map((profile) => ({ data: { kind: "profile", ...profile } })),
);
console.log(`added ${added.length} profiles`);
