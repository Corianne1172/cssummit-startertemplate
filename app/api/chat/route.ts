import Anthropic from "@anthropic-ai/sdk";
import { demoReplyFor, streamDemoReply } from "@/lib/chatbot/demo";
import { type ChatStreamEvent, chatRequestSchema } from "@/lib/chatbot/schema";
import { SYSTEM_PROMPT } from "@/lib/chatbot/system-prompt";
import { serverEnv } from "@/lib/env";

/**
 * POST /api/chat: takes the conversation so far, streams the next assistant reply back as
 * NDJSON (see ChatStreamEvent in lib/chatbot/schema.ts).
 *
 * The API key is read here, on the server, through lib/env.ts. It is never sent to the browser.
 * With no ANTHROPIC_API_KEY the route answers with canned demo replies instead.
 */

/** Used when ANTHROPIC_MODEL is empty. */
const DEFAULT_MODEL = "claude-opus-5-5";

/**
 * Upper limit on one reply, in tokens (about 3,000 words). Keeps a single reply's cost small;
 * raise it if replies get cut off.
 */
const MAX_TOKENS = 4096;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "The request body must be JSON.");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      parsed.error.issues[0]?.message ?? "Invalid request.",
    );
  }
  const messages = parsed.data.messages;
  const { anthropicApiKey, anthropicModel } = serverEnv();

  // Demo mode: no key, so stream a canned reply the same way a real one is streamed.
  if (!anthropicApiKey) {
    const question = messages.at(-1)?.content ?? "";
    const pieces = streamDemoReply(demoReplyFor(question), request.signal);
    return ndjsonResponse(async function* () {
      yield { type: "start", mode: "demo" };
      for await (const text of pieces) yield { type: "text", text };
      yield { type: "done" };
    });
  }

  const client = new Anthropic({ apiKey: anthropicApiKey });
  const stream = client.messages.stream(
    {
      model: anthropicModel ?? DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      // Chat replies don't need deep reasoning: low effort answers faster and costs less.
      output_config: { effort: "low" },
      messages,
    },
    // Stop paying for tokens when the person presses Stop or leaves the page.
    { signal: request.signal },
  );

  // Wait for the first event before answering, so a bad key, an unknown model or a rate limit
  // comes back as a clear error instead of a broken stream.
  const events = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    first = await events.next();
  } catch (error) {
    const { status, message } = describeError(error);
    return errorResponse(status, message);
  }

  return ndjsonResponse(
    async function* () {
      yield { type: "start", mode: "live" };
      try {
        let result = first;
        while (!result.done) {
          const event = result.value;
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            yield { type: "text", text: event.delta.text };
          }
          result = await events.next();
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "max_tokens") {
          yield {
            type: "notice",
            message:
              "The reply hit the length limit and was cut short. Ask for a shorter answer, or raise MAX_TOKENS in app/api/chat/route.ts.",
          };
        } else if (final.stop_reason === "refusal") {
          yield {
            type: "notice",
            message:
              "Claude declined to answer this. Try rephrasing the question.",
          };
        }
        yield { type: "done" };
      } catch (error) {
        if (request.signal.aborted) return;
        yield { type: "error", message: describeError(error).message };
      }
    },
    () => stream.abort(),
  );
}

function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

/** Turns a stream of events into a streamed response with one JSON object per line. */
function ndjsonResponse(
  produce: () => AsyncGenerator<ChatStreamEvent>,
  onCancel?: () => void,
): Response {
  const encoder = new TextEncoder();
  const events = produce();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await events.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      onCancel?.();
      await events.return(undefined);
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** A safe, plain-language message for the page. Details go to the server log only. */
function describeError(error: unknown): { status: number; message: string } {
  console.error("[chat]", error);
  if (error instanceof Anthropic.AuthenticationError) {
    return {
      status: 500,
      message:
        "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in .env.local (or your Vercel project) and restart the server.",
    };
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return {
      status: 500,
      message:
        "This API key is not allowed to use that model. Check ANTHROPIC_MODEL and your Anthropic account.",
    };
  }
  if (error instanceof Anthropic.NotFoundError) {
    return {
      status: 500,
      message:
        "Claude could not find that model. Check ANTHROPIC_MODEL, or leave it empty to use the default.",
    };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return {
      status: 429,
      message: "Too many requests right now. Wait a moment and try again.",
    };
  }
  if (error instanceof Anthropic.InternalServerError) {
    return {
      status: 503,
      message: "Claude is busy or having trouble. Try again in a moment.",
    };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return {
      status: 502,
      message:
        "The server could not reach Claude. Check the internet connection.",
    };
  }
  if (error instanceof Anthropic.APIError) {
    // 400 covers a used-up credit balance and invalid requests; 402 is a billing problem.
    return {
      status: 500,
      message:
        error.status === 402 || error.status === 400
          ? "Claude rejected the request. Check your Anthropic account's credit balance and billing, then try again."
          : "Something went wrong talking to Claude. Try again.",
    };
  }
  return { status: 500, message: "Something went wrong. Try again." };
}
