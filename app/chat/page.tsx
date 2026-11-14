import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Chat } from "@/components/chatbot/chat";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { BOT_DESCRIPTION, BOT_NAME } from "@/lib/chatbot/system-prompt";
import { serverEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Chat",
  description: BOT_DESCRIPTION,
};

export default function ChatPage() {
  return (
    <Container size="narrow" className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Chat"
        title={`Ask ${BOT_NAME}`}
        description={BOT_DESCRIPTION}
      />
      <Suspense fallback={<ChatSkeleton />}>
        <ChatWithMode />
      </Suspense>
    </Container>
  );
}

/**
 * Decides demo mode at request time, so adding the key on Vercel takes effect without a
 * rebuild. Only a true/false reaches the browser, never the key itself.
 */
async function ChatWithMode() {
  await connection();
  const demo = !serverEnv().anthropicApiKey;
  return <Chat demo={demo} />;
}

function ChatSkeleton() {
  return (
    <div
      aria-hidden
      className="surface h-[min(60dvh,36rem)] min-h-72 animate-pulse rounded-card"
    />
  );
}
