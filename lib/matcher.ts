/**
 * Mentor match score. A TypeScript port of the team's Python formula
 * (`calculate_professional_match` in test_matcher.md). It compares professional fields only;
 * no identity attributes are stored or scored.
 */

import type { Profile } from "@/lib/profiles";

export type MatchFactor =
  | "interests"
  | "skills"
  | "needs"
  | "careerGoals"
  | "education"
  | "mentorshipStyle"
  | "availability";

export type MatchResult = {
  /** 0 to 100, rounded to a whole number. */
  score: number;
  /** 2 to 3 short plain-language reasons, strongest first. */
  reasons: string[];
  /** Each factor's 0..1 fraction, or null when it was skipped. */
  breakdown: Record<MatchFactor, number | null>;
};

// Design assumptions from the team's formula, not research-validated weights.
const WEIGHTS: Record<MatchFactor, number> = {
  interests: 0.25,
  skills: 0.2,
  needs: 0.15,
  careerGoals: 0.15,
  education: 0.1,
  mentorshipStyle: 0.1,
  availability: 0.05,
};

const FACTORS = Object.keys(WEIGHTS) as MatchFactor[];

const REASONS: Record<MatchFactor, (items: string, count: number) => string> = {
  interests: (items) => `You both focus on ${items}`,
  skills: (items) => `You both know ${items}`,
  needs: (items) => `Can teach you ${items}`,
  careerGoals: (items, count) =>
    `Shares your goal${count > 1 ? "s" : ""}: ${items}`,
  education: (items) => `Same education path: ${items}`,
  mentorshipStyle: (items) => `Mentors the way you like: ${items}`,
  availability: (items) => `Free when you are: ${items}`,
};

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

type Scored = { fraction: number | null; items: string[] };

const distinct = (items: string[]) =>
  new Set(items.map((item) => item.toLowerCase())).size;

/** Items of `mine` that also appear in `theirs`, ignoring case. Keeps the spelling in `mine`. */
function shared(mine: string[], theirs: string[]): string[] {
  const other = new Set(theirs.map((item) => item.toLowerCase()));
  const seen = new Set<string>();
  return mine.filter((item) => {
    const key = item.toLowerCase();
    if (!other.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Intersection over union. Skipped (null) when either side is empty. */
function overlap(mine: string[], theirs: string[]): Scored {
  const items = shared(mine, theirs);
  const a = distinct(mine);
  const b = distinct(theirs);
  if (a === 0 || b === 0) return { fraction: null, items };
  return { fraction: items.length / (a + b - items.length), items };
}

/** Share of the mentee's needs that the mentor's skills cover. Skipped when there are no needs. */
function coverage(needs: string[], skills: string[]): Scored {
  const items = shared(needs, skills);
  const total = distinct(needs);
  return { fraction: total === 0 ? null : items.length / total, items };
}

export function matchScore(mentee: Profile, mentor: Profile): MatchResult {
  const sameEducation =
    mentee.educationLevel !== "" &&
    mentee.educationLevel === mentor.educationLevel;

  const scored: Record<MatchFactor, Scored> = {
    interests: overlap(mentee.interests, mentor.interests),
    skills: overlap(mentee.skills, mentor.skills),
    needs: coverage(mentee.needs, mentor.skills),
    careerGoals: overlap(mentee.careerGoals, mentor.careerGoals),
    education: {
      fraction: sameEducation ? 1 : 0,
      items: sameEducation ? [mentee.educationLevel] : [],
    },
    mentorshipStyle: overlap(mentee.mentorshipStyle, mentor.mentorshipStyle),
    availability: overlap(mentee.availability, mentor.availability),
  };

  let total = 0;
  let availableWeight = 0;
  for (const factor of FACTORS) {
    const { fraction } = scored[factor];
    if (fraction === null) continue;
    total += WEIGHTS[factor] * fraction;
    availableWeight += WEIGHTS[factor];
  }

  const contribution = (factor: MatchFactor) =>
    WEIGHTS[factor] * (scored[factor].fraction ?? 0);

  const reasons = FACTORS.filter((factor) => contribution(factor) > 0)
    .sort((a, b) => contribution(b) - contribution(a))
    .slice(0, 3)
    .map((factor) => {
      const { items } = scored[factor];
      return REASONS[factor](listFormat.format(items), items.length);
    });

  return {
    score:
      availableWeight === 0 ? 0 : Math.round((total / availableWeight) * 100),
    reasons: reasons.length
      ? reasons
      : ["A different background that could widen your view"],
    breakdown: Object.fromEntries(
      FACTORS.map((factor) => [factor, scored[factor].fraction]),
    ) as Record<MatchFactor, number | null>,
  };
}
