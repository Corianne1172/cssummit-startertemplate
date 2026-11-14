#!/usr/bin/env node
// Checks that the Supabase values in .env.local / .env reach your project.
// Prints variable names, HTTP status codes and table names. It never prints a key.
// Run: pnpm supabase:check

// Same files Next.js loads. .env.local first so it wins, as it does in the app.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File not there: fine.
  }
}

// Imported after the files are loaded: lib/env.ts reads the values at import time.
const { publicEnv, serverEnv, optionalServerEnv } = await import(
  "../lib/env.ts"
);

let failed = false;
const fail = (message) => {
  failed = true;
  console.log(`  FAIL  ${message}`);
};
const pass = (message) => console.log(`  ok    ${message}`);

/** The value under the name the app reads, or under a common wrong name (reported). */
function find(expected, value, ...wrongNames) {
  if (value) {
    pass(`${expected} is set`);
    return value;
  }
  for (const name of wrongNames) {
    const other = optionalServerEnv(name);
    if (other) {
      fail(`${name} is set, but the app reads ${expected}. Rename it.`);
      return other;
    }
  }
  fail(`${expected} is not set`);
  return undefined;
}

console.log("Variables");
const url = find(
  "NEXT_PUBLIC_SUPABASE_URL",
  publicEnv.supabaseUrl,
  "SUPABASE_URL",
);
const publishableKey = find(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  publicEnv.supabasePublishableKey,
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE",
);
const secretKey = find(
  "SUPABASE_SECRET_KEY",
  serverEnv().supabaseSecretKey,
  "SUPABASE_SECRET",
);

let origin;
try {
  const parsed = new URL(url ?? "");
  // Keys are only ever sent to a Supabase host, never to whatever the URL happens to say.
  if (
    parsed.protocol === "https:" &&
    /^[a-z0-9]+\.supabase\.co$/.test(parsed.hostname)
  ) {
    origin = parsed.origin;
    if (parsed.pathname !== "/")
      fail("The URL has an extra path. Use just https://<ref>.supabase.co");
  } else {
    // Describe the shape without printing the value.
    const hint = parsed.protocol.startsWith("postgres")
      ? "it is a database connection string"
      : parsed.hostname.endsWith("supabase.com")
        ? "it is a dashboard link"
        : parsed.protocol !== "https:"
          ? `it starts with ${parsed.protocol}//`
          : "its host does not end in .supabase.co";
    fail(
      `The URL must be https://<ref>.supabase.co (${hint}). No request was sent.`,
    );
  }
} catch {
  if (url) fail("The URL is not a valid URL");
}
if (publishableKey && publishableKey === secretKey)
  fail("The publishable and secret keys are the same value");
if (publishableKey?.startsWith("sb_secret_"))
  fail("The publishable variable holds a SECRET key. Swap it out.");

async function get(label, path, key) {
  if (!origin || !key) return undefined;
  try {
    const response = await fetch(origin + path, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) pass(`${label}: HTTP ${response.status}`);
    else fail(`${label}: HTTP ${response.status}`);
    return response;
  } catch (error) {
    fail(`${label}: no response (${error.cause?.code ?? error.name})`);
    return undefined;
  }
}

console.log("Requests");
await get("Auth, publishable key", "/auth/v1/settings", publishableKey);
const rest = await get("Database API, secret key", "/rest/v1/", secretKey);
if (rest?.ok) {
  const spec = await rest.json().catch(() => undefined);
  const tables = Object.keys(spec?.paths ?? {})
    .filter((path) => path !== "/" && !path.startsWith("/rpc/"))
    .map((path) => path.slice(1));
  console.log(
    `  tables in the public schema: ${tables.length ? tables.join(", ") : "(none yet)"}`,
  );
  for (const table of tables) {
    const columns = Object.entries(spec.definitions?.[table]?.properties ?? {})
      .map(([name, column]) => `${name} ${column.format ?? column.type}`)
      .join(", ");
    console.log(`    ${table}: ${columns}`);
  }
}

console.log("Anthropic");
const anthropicKey = serverEnv().anthropicApiKey;
if (!anthropicKey)
  fail("ANTHROPIC_API_KEY is not set (chat stays in demo mode)");
else {
  // Listing models is free: it proves the key works without spending credit.
  const response = await fetch("https://api.anthropic.com/v1/models?limit=1", {
    headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
    signal: AbortSignal.timeout(15000),
  }).catch(() => undefined);
  if (response?.ok) pass(`ANTHROPIC_API_KEY works: HTTP ${response.status}`);
  else fail(`ANTHROPIC_API_KEY: HTTP ${response?.status ?? "no response"}`);
}

console.log(failed ? "\nNot connected yet." : "\nConnected.");
process.exit(failed ? 1 : 0);
