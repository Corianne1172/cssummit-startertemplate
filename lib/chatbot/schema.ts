import { z } from "zod";

/**
 * Limits on what the browser may send to /api/chat. They keep each request (and its cost)
 * small, and stop someone from pasting a novel into your bot. Shared by the page and the route.
 */
export const CHAT_LIMITS = {
  /** Most messages sent per request. Older ones are dropped by the page before sending. */
  maxMessages: 30,
  /** Longest message a person can type. */
  maxUserChars: 2000,
  /** Longest assistant reply the page sends back as history (a long reply fits). */
  maxAssistantChars: 16000,
  /** All messages together, in characters (roughly 12k tokens). */
  maxTotalChars: 48000,
} as const;

const userMessage = z.object({
  role: z.literal("user"),
  content: z
    .string()
    .trim()
    .min(1, "Messages cannot be empty.")
    .max(
      CHAT_LIMITS.maxUserChars,
      `Messages can be at most ${CHAT_LIMITS.maxUserChars} characters.`,
    ),
});

const assistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string().trim().min(1).max(CHAT_LIMITS.maxAssistantChars),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(z.discriminatedUnion("role", [userMessage, assistantMessage]))
    .min(1, "Send at least one message.")
    .max(
      CHAT_LIMITS.maxMessages,
      `Send at most ${CHAT_LIMITS.maxMessages} messages.`,
    )
    .refine((messages) => messages[0]?.role === "user", {
      message: "The conversation must start with a user message.",
    })
    .refine((messages) => messages.at(-1)?.role === "user", {
      message: "The last message must be from the user.",
    })
    .refine(
      (messages) =>
        messages.reduce((total, m) => total + m.content.length, 0) <=
        CHAT_LIMITS.maxTotalChars,
      { message: "The conversation is too long. Clear it and start again." },
    ),
});

export type ChatMessage = z.infer<typeof chatRequestSchema>["messages"][number];

/**
 * What /api/chat streams back: one JSON object per line (NDJSON).
 * - start: first line; mode says whether Claude or the demo is answering
 * - text: a piece of the reply, append it
 * - notice: something the person should know (reply cut short, request declined)
 * - error: the reply failed part-way
 * - done: last line of a complete reply
 */
export type ChatStreamEvent =
  | { type: "start"; mode: "live" | "demo" }
  | { type: "text"; text: string }
  | { type: "notice"; message: string }
  | { type: "error"; message: string }
  | { type: "done" };
