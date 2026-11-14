"use client";

import {
  ArrowUpIcon,
  InfoIcon,
  RotateCcwIcon,
  SquareIcon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHAT_LIMITS,
  type ChatMessage,
  type ChatStreamEvent,
} from "@/lib/chatbot/schema";
import { BOT_NAME, STARTER_PROMPTS } from "@/lib/chatbot/system-prompt";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** streaming: arriving now; stopped: the person pressed Stop; error: failed part-way */
  status: "streaming" | "done" | "stopped" | "error";
  demo?: boolean;
  notice?: string;
};

const CLEARED = "cleared";

let nextId = 0;
const newId = () => `m${++nextId}`;

/**
 * The conversation is kept in this component's state only: nothing is saved, and a page
 * refresh starts over. Each send posts the recent history to /api/chat and reads the reply as
 * it streams in.
 */
export function Chat({ demo }: { demo: boolean }) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const logRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const stickToBottom = React.useRef(true);
  const inputId = React.useId();
  const hintId = React.useId();

  // Keep the newest text in view while it streams, unless the reader scrolled up.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs whenever messages change
  React.useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [messages]);

  // Stop any reply in progress when leaving the page.
  React.useEffect(() => () => abortRef.current?.abort(), []);

  function updateMessage(id: string, change: (m: Message) => Message) {
    setMessages((all) => all.map((m) => (m.id === id ? change(m) : m)));
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    if (question.length > CHAT_LIMITS.maxUserChars) {
      setError(
        `That message is too long. Keep it under ${CHAT_LIMITS.maxUserChars} characters.`,
      );
      return;
    }

    const userMessage: Message = {
      id: newId(),
      role: "user",
      content: question,
      status: "done",
    };
    const reply: Message = {
      id: newId(),
      role: "assistant",
      content: "",
      status: "streaming",
    };
    const history = recentHistory([...messages, userMessage]);

    setMessages((all) => [...all, userMessage, reply]);
    setInput("");
    setError(null);
    setBusy(true);
    setAnnouncement(`${BOT_NAME} is replying.`);
    stickToBottom.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    let finalText = "";
    let finished = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error ?? `The chat server answered with ${response.status}.`,
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const handle = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as ChatStreamEvent;
        if (event.type === "start") {
          updateMessage(reply.id, (m) => ({
            ...m,
            demo: event.mode === "demo",
          }));
        } else if (event.type === "text") {
          finalText += event.text;
          updateMessage(reply.id, (m) => ({
            ...m,
            content: m.content + event.text,
          }));
        } else if (event.type === "notice") {
          updateMessage(reply.id, (m) => ({ ...m, notice: event.message }));
        } else if (event.type === "error") {
          throw new Error(event.message);
        } else if (event.type === "done") {
          finished = true;
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) handle(line);
      }
      handle(buffer + decoder.decode());

      if (!finished)
        throw new Error("The connection closed before the reply finished.");
      updateMessage(reply.id, (m) => ({ ...m, status: "done" }));
      setAnnouncement(`${BOT_NAME} said: ${finalText}`);
    } catch (caught) {
      if (controller.signal.aborted) {
        // Clear also aborts; it has already emptied the list and announced itself.
        if (controller.signal.reason !== CLEARED) {
          updateMessage(reply.id, (m) => ({ ...m, status: "stopped" }));
          setAnnouncement("Reply stopped.");
        }
      } else {
        const message =
          caught instanceof Error ? caught.message : "Something went wrong.";
        if (finalText) {
          // Keep what arrived, mark it as incomplete.
          updateMessage(reply.id, (m) => ({ ...m, status: "error" }));
        } else {
          // Nothing arrived: take the question back out and put it in the box to retry.
          setMessages((all) =>
            all.filter((m) => m.id !== reply.id && m.id !== userMessage.id),
          );
          setInput(question);
        }
        setError(message);
        setAnnouncement(`Error: ${message}`);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function clear() {
    abortRef.current?.abort(CLEARED);
    setMessages([]);
    setError(null);
    setInput("");
    setAnnouncement("Conversation cleared.");
    inputRef.current?.focus();
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter adds a new line. Ignore Enter while an IME is composing text.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void send(input);
    }
  }

  const empty = messages.length === 0;
  const remaining = CHAT_LIMITS.maxUserChars - input.length;

  return (
    <div className="flex flex-col gap-stack">
      {demo ? (
        <Alert variant="info">
          <InfoIcon aria-hidden />
          <AlertTitle>
            Demo mode: replies are pre-written, not from Claude
          </AlertTitle>
          <AlertDescription>
            <p>
              To get real answers, create an API key on your team&apos;s own
              Anthropic account, add{" "}
              <code className="font-mono">ANTHROPIC_API_KEY=your-key</code> to{" "}
              <code className="font-mono">.env.local</code>, and restart{" "}
              <code className="font-mono">pnpm dev</code>. Steps are in{" "}
              <code className="font-mono">kits/chatbot/README.md</code>.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <section
        aria-label="Conversation"
        className="surface flex flex-col overflow-hidden rounded-card"
      >
        <div
          ref={logRef}
          aria-busy={busy}
          onScroll={(event) => {
            const el = event.currentTarget;
            stickToBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          }}
          className="flex h-[min(60dvh,36rem)] min-h-72 flex-col gap-4 overflow-y-auto p-card"
        >
          {empty ? (
            <div className="m-auto flex w-full max-w-md flex-col gap-3 text-center">
              <p className="text-muted-foreground">
                Ask {BOT_NAME} a question, or try one of these:
              </p>
              <ul className="flex flex-col gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      onClick={() => void send(prompt)}
                      disabled={busy}
                      className="w-full rounded-control border border-border bg-card px-3 py-2 text-left text-sm text-card-foreground transition-colors outline-none hover:border-primary hover:bg-primary-tint focus-visible:ring-3 focus-visible:ring-ring/60 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="flex flex-col gap-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </ol>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2 border-t border-border p-card"
        >
          <Label htmlFor={inputId} className="sr-only">
            Message {BOT_NAME}
          </Label>
          <Textarea
            id={inputId}
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Message ${BOT_NAME}…`}
            maxLength={CHAT_LIMITS.maxUserChars}
            aria-describedby={hintId}
            rows={2}
            className="max-h-48 min-h-16 resize-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p id={hintId} className="text-xs text-muted-foreground">
              Enter to send, Shift+Enter for a new line
              {remaining < 200 ? ` · ${remaining} characters left` : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                disabled={empty && !input && !error}
              >
                <RotateCcwIcon aria-hidden />
                Clear
              </Button>
              {busy ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stop}
                >
                  <SquareIcon aria-hidden />
                  Stop
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={!input.trim()}>
                  <ArrowUpIcon aria-hidden />
                  Send
                </Button>
              )}
            </div>
          </div>
        </form>
      </section>

      {error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon aria-hidden />
          <AlertTitle>The reply failed</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Screen readers hear the whole reply once it is complete, not every streamed word. */}
      <output aria-live="polite" className="sr-only">
        {announcement}
      </output>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const mine = message.role === "user";
  return (
    <li
      className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">{mine ? "You" : BOT_NAME}</span>
        {message.demo ? <Badge variant="warning">Demo</Badge> : null}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-card px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap sm:max-w-[75%]",
          mine
            ? "bg-primary-tint text-foreground"
            : "border border-border bg-card text-card-foreground",
        )}
      >
        {message.content ||
          (message.status === "streaming" ? (
            <span className="text-muted-foreground">Thinking…</span>
          ) : message.status === "stopped" ? (
            <span className="text-muted-foreground">(No reply)</span>
          ) : null)}
        {message.status === "streaming" && message.content ? (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-text-bottom"
          />
        ) : null}
      </div>
      {message.status === "stopped" ? (
        <p className="text-xs text-muted-foreground">Stopped</p>
      ) : null}
      {message.status === "error" ? (
        <p className="text-xs text-destructive">Reply incomplete</p>
      ) : null}
      {message.notice ? (
        <p className="max-w-[85%] text-xs text-warning sm:max-w-[75%]">
          {message.notice}
        </p>
      ) : null}
    </li>
  );
}

/**
 * The messages to send: complete ones only, newest first until a limit is hit, starting with a
 * question. Long conversations keep working; the bot just forgets the oldest turns.
 */
function recentHistory(all: Message[]): ChatMessage[] {
  const usable = all
    .filter(
      (m) =>
        m.content.trim() && (m.role === "user" || m.status !== "streaming"),
    )
    .map(
      (m): ChatMessage =>
        m.role === "user"
          ? { role: "user", content: m.content }
          : {
              role: "assistant",
              content: m.content.slice(0, CHAT_LIMITS.maxAssistantChars),
            },
    );
  const kept: ChatMessage[] = [];
  let total = 0;
  for (let i = usable.length - 1; i >= 0; i--) {
    const message = usable[i];
    if (
      kept.length >= CHAT_LIMITS.maxMessages ||
      total + message.content.length > CHAT_LIMITS.maxTotalChars
    )
      break;
    kept.unshift(message);
    total += message.content.length;
  }
  while (kept[0] && kept[0].role !== "user") kept.shift();
  return kept;
}
