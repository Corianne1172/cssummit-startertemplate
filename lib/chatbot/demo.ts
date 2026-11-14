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
  `${PREFIX}Here is a sample roadmap toward a quantum and microelectronics technician job.

1. Learn what the role is. The Chicago Quantum Exchange shares information on quantum careers and the training they call for.
2. Build the basics. Ask City Colleges of Chicago, including Olive-Harvey College on the far South Side, which math, electronics and lab courses fit technician work.
3. Find a mentor who works in the field on the Match page at /match and ask what their first year looked like.
4. Follow the Illinois Quantum and Microelectronics Park (IQMP) to see which employers and job types arrive.

Check details with each program before you apply, because things change.`,
  `${PREFIX}Here is a sample roadmap for someone with construction experience.

1. Write down the trades work you have done and any cards or certificates you hold.
2. Talk to HIRE360 about construction trade apprenticeships. Chicago Women in Trades prepares women for the same kind of careers.
3. Find a mentor in construction or civil engineering on the Match page at /match.
4. Follow the Illinois Quantum and Microelectronics Park (IQMP) to see which contractors and job types come to the site.

Check details with each program before you apply, because things change.`,
  `${PREFIX}Here is a sample roadmap for a first software or IT job.

1. Pick a starting lane: IT support, software or cybersecurity.
2. Look at job-focused training. Per Scholas Chicago, i.c.stars and Year Up each train people for tech work, and City Colleges of Chicago offers certificates and degrees.
3. Not sure which one fits? A Chicago Cook Workforce Partnership job center offers career coaching and training referrals.
4. Find a mentor who works in tech on the Match page at /match.

Check details with each program before you apply, because things change.`,
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
