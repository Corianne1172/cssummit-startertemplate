// Self-check for lib/matcher.ts, using the example data from test_matcher.md.
// Run: node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/matcher-check.mjs

import assert from "node:assert/strict";
import { matchScore } from "../lib/matcher.ts";

const base = { title: "", neighborhood: "", bio: "", needs: [] };

const mentee = {
  ...base,
  id: "mentee",
  role: "mentee",
  name: "Mentee",
  interests: ["quantum computing", "machine learning"],
  skills: ["Python", "statistics"],
  needs: ["quantum algorithms", "research writing"],
  careerGoals: ["PhD", "quantum research"],
  educationLevel: "Masters",
  mentorshipStyle: ["structured", "collaborative"],
  availability: ["Monday", "Wednesday"],
};

const mentorA = {
  ...base,
  id: "a",
  role: "mentor",
  name: "Mentor A",
  interests: ["quantum computing", "quantum algorithms"],
  skills: ["Python", "quantum algorithms", "research writing"],
  careerGoals: ["PhD", "quantum research"],
  educationLevel: "PhD",
  mentorshipStyle: ["structured", "collaborative"],
  availability: ["Monday", "Wednesday"],
};

const mentorB = {
  ...base,
  id: "b",
  role: "mentor",
  name: "Mentor B",
  interests: ["machine learning", "artificial intelligence"],
  skills: ["Python", "statistics", "machine learning"],
  careerGoals: ["industry research"],
  educationLevel: "PhD",
  mentorshipStyle: ["independent"],
  availability: ["Tuesday", "Thursday"],
};

const a = matchScore(mentee, mentorA);
const b = matchScore(mentee, mentorB);

// Python gives 58.33 and 21.67.
assert.equal(a.score, 58);
assert.equal(b.score, 22);
assert.equal(a.breakdown.needs, 1);
assert.equal(a.breakdown.education, 0);
assert.equal(
  a.reasons[0],
  "Can teach you quantum algorithms and research writing",
);
assert.equal(a.reasons.length, 3);

// Comparisons ignore case.
assert.equal(
  matchScore({ ...mentee, skills: ["PYTHON", "Statistics"] }, mentorA).score,
  58,
);

// Empty lists are skipped and the rest is re-normalised: only education counts here.
const empty = {
  ...mentee,
  interests: [],
  skills: [],
  needs: [],
  careerGoals: [],
  mentorshipStyle: [],
  availability: [],
};
const skipped = matchScore(empty, { ...mentorA, educationLevel: "Masters" });
assert.equal(skipped.score, 100);
assert.equal(skipped.breakdown.interests, null);
assert.deepEqual(skipped.reasons, ["Same education path: Masters"]);

// Nothing in common.
assert.deepEqual(matchScore(empty, mentorA).reasons, [
  "A different background that could widen your view",
]);

console.log("matcher ok");
