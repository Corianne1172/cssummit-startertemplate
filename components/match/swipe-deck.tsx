"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recordMatch } from "@/app/match/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchResult } from "@/lib/matcher";
import type { Profile } from "@/lib/profiles";

type Scored = { profile: Profile; match: MatchResult };

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** A first message the mentee could send, built from the strongest reason for the match. */
function firstMessageFor(mentee: Profile, { profile, match }: Scored) {
  const skills = new Set(profile.skills.map((skill) => skill.toLowerCase()));
  const teachable = mentee.needs.filter((need) =>
    skills.has(need.toLowerCase()),
  );
  const why =
    teachable.length > 0
      ? `I saw you can teach ${listFormat.format(teachable.slice(0, 3))}. `
      : match.reasons[0]
        ? `We were matched because: ${match.reasons[0]}. `
        : "";
  return `Hi ${profile.name}, I'm ${mentee.name}. ${why}Could we set up a first chat?`;
}

export function SwipeDeck({
  mentee,
  mentors,
  initialMatches,
}: {
  mentee: Profile;
  mentors: Scored[];
  initialMatches: number;
}) {
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState(false);
  const [matches, setMatches] = useState(initialMatches);

  const current = mentors[index];
  const mentorId = current?.profile.id;

  function next() {
    setMatched(false);
    setIndex((i) => i + 1);
  }

  function connect(id: string) {
    setMatched(true);
    setMatches((count) => count + 1); // optimistic: every demo mentor accepts
    void recordMatch(id);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: next and connect only use state setters
  useEffect(() => {
    if (!mentorId || matched) return;
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.metaKey || event.ctrlKey) return; // browser back/forward
      if (event.key === "ArrowLeft") next();
      if (event.key === "ArrowRight" && mentorId) connect(mentorId);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mentorId, matched]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          Browsing as {mentee.name}, {mentee.role} (demo)
        </p>
        <p>
          Matches made:{" "}
          <span className="font-semibold text-foreground">{matches}</span>
          {current ? ` · ${index + 1} of ${mentors.length}` : null}
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {matched && current
          ? `It's a match with ${current.profile.name}.`
          : null}
      </p>

      {!current ? (
        <Card>
          <CardHeader>
            <CardTitle>You have seen everyone</CardTitle>
            <CardDescription>
              Matches made so far: {matches}. Turn a match into a plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link href="/chat">Build my roadmap</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => setIndex(0)}>
              Start over
            </Button>
          </CardContent>
        </Card>
      ) : matched ? (
        <Card>
          <CardHeader>
            <CardTitle>It's a match with {current.profile.name}</CardTitle>
            <CardDescription>
              {current.profile.name} accepted. Here is a first message you could
              send:
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <blockquote className="border-l-2 border-primary pl-4 text-base text-pretty">
              {firstMessageFor(mentee, current)}
            </blockquote>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button asChild size="lg">
                <Link href="/chat">Build my roadmap</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={next}>
                Keep browsing
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{current.profile.name}</CardTitle>
              <CardDescription>
                {current.profile.title} · {current.profile.neighborhood}
              </CardDescription>
              <CardAction>
                <Badge className="h-8 px-3 text-sm">
                  {current.match.score}% match
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-base text-pretty">{current.profile.bio}</p>
              <ul aria-label="Top skills" className="flex flex-wrap gap-2">
                {current.profile.skills.slice(0, 5).map((skill) => (
                  <li key={skill}>
                    <Badge variant="tint">{skill}</Badge>
                  </li>
                ))}
              </ul>
              {current.match.reasons.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-semibold">Why you matched</h2>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
                    {current.match.reasons.slice(0, 3).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={next}
              aria-keyshortcuts="ArrowLeft"
            >
              Pass
            </Button>
            <Button
              size="lg"
              onClick={() => connect(current.profile.id)}
              aria-keyshortcuts="ArrowRight"
            >
              Connect
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Tip: left arrow to pass, right arrow to connect.
          </p>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Safety: first names only, no photos. All profiles in this demo are fake.
      </p>
    </div>
  );
}
