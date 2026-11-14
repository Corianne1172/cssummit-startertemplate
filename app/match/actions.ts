"use server";

import { saveMatch } from "@/lib/connect";
import { DEMO_MENTEE_ID } from "@/lib/profiles";

/** Records that the demo mentee connected with a mentor. Best effort. */
export async function recordMatch(mentorId: string): Promise<void> {
  // Server actions are public endpoints: only accept a short id-shaped string.
  if (typeof mentorId !== "string" || !/^[\w-]{1,64}$/.test(mentorId)) return;
  await saveMatch(DEMO_MENTEE_ID, mentorId);
}
