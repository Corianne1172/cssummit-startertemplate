/**
 * Server-only access to the team's single Supabase table, `Connect`.
 *
 * Every row keeps its content in one JSON column, `data`, tagged with `kind`
 * ("profile" or "match"). Calls use the secret key, so import this from server code only
 * (server components, server actions, route handlers).
 *
 * ponytail: one JSON table and plain fetch, no client library. Move to real columns and
 * @supabase/supabase-js when the app needs login or row-level security.
 */

import { publicEnv, serverEnv } from "@/lib/env";
import { type Profile, SEED_PROFILES } from "@/lib/profiles";

function request(query: string, init?: RequestInit) {
  const url = publicEnv.supabaseUrl;
  const key = serverEnv().supabaseSecretKey;
  if (!url || !key) return undefined;
  return fetch(`${url}/rest/v1/Connect${query}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(5000),
  });
}

/** Profiles from Supabase. Falls back to the bundled seed so the demo never breaks. */
export async function getProfiles(): Promise<Profile[]> {
  try {
    const response = await request("?select=data&data->>kind=eq.profile");
    if (response?.ok) {
      const rows = (await response.json()) as { data: Profile }[];
      if (rows.length > 0) return rows.map((row) => row.data);
    }
  } catch {
    // Supabase unreachable: use the seed.
  }
  return SEED_PROFILES;
}

/** Records a match. Best effort: a failed write must not break the demo. */
export async function saveMatch(
  menteeId: string,
  mentorId: string,
): Promise<void> {
  try {
    await request("", {
      method: "POST",
      body: JSON.stringify({ data: { kind: "match", menteeId, mentorId } }),
    });
  } catch {
    // Ignored on purpose.
  }
}

/** How many matches have been made (the impact counter). 0 when Supabase is not set up. */
export async function countMatches(): Promise<number> {
  try {
    const response = await request("?select=id&data->>kind=eq.match");
    if (response?.ok) return ((await response.json()) as unknown[]).length;
  } catch {
    // Fall through.
  }
  return 0;
}
