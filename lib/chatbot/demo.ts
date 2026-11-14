import { STARTER_PROMPTS } from "./system-prompt";

/**
 * Demo mode: canned replies used when ANTHROPIC_API_KEY is not set, so the /chat page works
 * before your team has a key. They are streamed the same way real replies are. Nothing here
 * calls Claude, and every reply says it is a demo.
 */

const PREFIX = "[Demo reply, not from Claude]\n\n";

const GENERIC = `${PREFIX}This chatbot is in demo mode, so this is a pre-written answer instead of a real one.

To get real answers from Claude:
1. Create an API key on your team's own Anthropic account.
2. Add it to .env.local as ANTHROPIC_API_KEY=your-key.
3. Restart pnpm dev and send your message again.

Then edit lib/chatbot/system-prompt.ts to give the bot its own job. The steps are in kits/chatbot/README.md.`;

// These match the example STARTER_PROMPTS. If you change the prompts, unmatched questions get
// the generic reply above, which is fine.
const STARTER_REPLIES = [
  `${PREFIX}Most street problems, like potholes and streetlights that are out, go through Chicago 311.

1. Call 311, or use the CHI 311 app or website.
2. Give the exact address or the nearest cross streets.
3. Save the request number so you can check on it later.

(A real reply from Claude would follow the instructions in lib/chatbot/system-prompt.ts.)`,
  `${PREFIX}Chicago is split into 50 wards, and each ward elects an alderperson to the City Council.

Your alderperson votes on city laws and the budget, and their ward office can help with local problems like trash pickup, permits and street repairs.

To find yours, look up your address on the city's ward map, then call or email the ward office.`,
  `${PREFIX}During heat emergencies the city opens cooling centers, and public libraries and park field houses are often open as places to cool off.

1. Check chicago.gov or call 311 for today's locations and hours.
2. Bring water and any medicine you need.
3. If someone shows signs of heat stroke, call 911.`,
];

export function demoReplyFor(question: string): string {
  const index = STARTER_PROMPTS.findIndex(
    (prompt) => prompt.trim().toLowerCase() === question.trim().toLowerCase(),
  );
  return STARTER_REPLIES[index] ?? GENERIC;
}

/** Splits a reply into small pieces and yields them with a short pause, like a real stream. */
export async function* streamDemoReply(
  reply: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const pieces = reply.match(/\S+\s*/g) ?? [reply];
  for (const piece of pieces) {
    if (signal.aborted) return;
    await new Promise((resolve) => setTimeout(resolve, 35));
    yield piece;
  }
}
