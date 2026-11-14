/**
 * A small, hand-curated list of real Chicago training programs and the job categories the
 * roadmap chatbot may point to. The chatbot is told to recommend ONLY what is listed here.
 *
 * Descriptions are deliberately cautious: no costs, dates or eligibility rules, because those
 * change. The chatbot tells people to confirm details with the program itself.
 */

export const JOB_CATEGORIES = [
  "Construction and skilled trades",
  "Civil engineering and infrastructure",
  "Software and IT support",
  "Cybersecurity and site security",
  "AI and data science",
  "Quantum and microelectronics technician",
  "Facilities and custodial",
  "Catering and hospitality",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export type Program = {
  name: string;
  /** What it is, in one cautious sentence. */
  what: string;
  /** Who it tends to suit. Not an eligibility rule. */
  suits: string;
  leadsTo: JobCategory[];
};

export const PROGRAMS: Program[] = [
  {
    name: "City Colleges of Chicago",
    what: "Chicago's public community college system, offering certificates and associate degrees across many fields.",
    suits:
      "Anyone who wants a structured path into a new field or a first credential.",
    leadsTo: [
      "Software and IT support",
      "Cybersecurity and site security",
      "AI and data science",
      "Civil engineering and infrastructure",
      "Quantum and microelectronics technician",
      "Catering and hospitality",
    ],
  },
  {
    name: "Olive-Harvey College",
    what: "One of the City Colleges of Chicago, located on the far South Side.",
    suits:
      "South Side residents who want college classes and advising close to home.",
    leadsTo: [
      "Civil engineering and infrastructure",
      "Software and IT support",
      "Quantum and microelectronics technician",
    ],
  },
  {
    name: "Chicago Quantum Exchange",
    what: "A Chicago-area hub that connects universities, national labs and companies working on quantum technology, and shares education and workforce information.",
    suits:
      "People curious about quantum careers who want to learn what the roles are and what training they call for.",
    leadsTo: ["Quantum and microelectronics technician", "AI and data science"],
  },
  {
    name: "Illinois Quantum and Microelectronics Park (IQMP)",
    what: "The quantum and microelectronics campus being built on the former U.S. Steel South Works site on Chicago's South Side; it is a job site and future employer hub, not a training program.",
    suits:
      "Anyone who wants to follow which employers, contractors and job types come to the park.",
    leadsTo: [
      "Construction and skilled trades",
      "Civil engineering and infrastructure",
      "Quantum and microelectronics technician",
      "Cybersecurity and site security",
      "Facilities and custodial",
      "Catering and hospitality",
    ],
  },
  {
    name: "i.c.stars",
    what: "A Chicago nonprofit that trains adults for technology careers, combining software skills with business and leadership training.",
    suits: "Career changers ready for an intensive program in tech.",
    leadsTo: ["Software and IT support", "AI and data science"],
  },
  {
    name: "Per Scholas Chicago",
    what: "The Chicago site of a national nonprofit that trains people for IT jobs such as tech support and cybersecurity.",
    suits: "Beginners who want job-focused IT training and help finding work.",
    leadsTo: ["Software and IT support", "Cybersecurity and site security"],
  },
  {
    name: "Year Up",
    what: "A national job-training nonprofit with a Chicago program that pairs skills training with work experience at employers.",
    suits: "Young adults who want training plus an internship-style placement.",
    leadsTo: ["Software and IT support", "Cybersecurity and site security"],
  },
  {
    name: "Chicago Women in Trades",
    what: "A Chicago nonprofit that prepares women for careers in construction and other skilled trades.",
    suits: "Women who want to enter or move up in the trades.",
    leadsTo: ["Construction and skilled trades"],
  },
  {
    name: "HIRE360",
    what: "A Chicago nonprofit that connects residents with construction trade apprenticeships and careers.",
    suits: "People who want a route into the construction trades.",
    leadsTo: [
      "Construction and skilled trades",
      "Civil engineering and infrastructure",
    ],
  },
  {
    name: "Chicago Cook Workforce Partnership",
    what: "The agency that runs the public workforce system for Chicago and Cook County, including job centers that offer career coaching and training referrals.",
    suits:
      "Anyone who is not sure where to start, or who wants help in any job category.",
    leadsTo: [...JOB_CATEGORIES],
  },
];
