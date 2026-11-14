import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { SwipeDeck } from "@/components/match/swipe-deck";
import { PageHeader } from "@/components/page-header";
import { countMatches, getProfiles } from "@/lib/connect";
import { matchScore } from "@/lib/matcher";
import { DEMO_MENTEE_ID } from "@/lib/profiles";

const DESCRIPTION =
  "Meet South Side professionals who can help you into a quantum-era job. Pass or connect.";

export const metadata: Metadata = {
  title: "Match",
  description: DESCRIPTION,
};

export default function MatchPage() {
  return (
    <Container size="narrow" className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Match"
        title="Find your mentor"
        description={DESCRIPTION}
      />
      <Suspense fallback={<DeckSkeleton />}>
        <Deck />
      </Suspense>
    </Container>
  );
}

/** Loads profiles at request time and scores every mentor for the demo mentee. */
async function Deck() {
  await connection();
  const [profiles, matches] = await Promise.all([
    getProfiles(),
    countMatches(),
  ]);
  const mentee = profiles.find((profile) => profile.id === DEMO_MENTEE_ID);
  if (!mentee) {
    return (
      <p className="text-muted-foreground">
        The demo profile is missing. Run the seed script and reload.
      </p>
    );
  }
  const mentors = profiles
    .filter((profile) => profile.role === "mentor")
    .map((profile) => ({ profile, match: matchScore(mentee, profile) }))
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <SwipeDeck mentee={mentee} mentors={mentors} initialMatches={matches} />
  );
}

function DeckSkeleton() {
  return (
    <div
      aria-hidden
      className="surface h-[min(60dvh,36rem)] min-h-72 animate-pulse rounded-card"
    />
  );
}
