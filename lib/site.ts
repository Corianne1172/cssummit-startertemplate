import installedKits from "@/kits.installed.json";

/**
 * The one place to rebrand: name, tagline, description and navigation.
 * `pnpm start-project` rewrites `name` for you. Installed kits add their nav links through
 * `kits.installed.json`, so you never edit this file to show a kit's page.
 */

export type NavLink = { label: string; href: string };

type InstalledKit = { name: string; nav?: NavLink[] };

const baseNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Match", href: "/match" },
];

function kitNav(): NavLink[] {
  const kits = (installedKits as { installed: InstalledKit[] }).installed;
  const links = kits.flatMap((kit) => kit.nav ?? []);
  const seen = new Set(baseNav.map((link) => link.href));
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export const site = {
  name: "QuantumConnect",
  shortName: "CS Summit",
  tagline:
    "Mentors and training roadmaps for the jobs coming to the South Side.",
  description:
    "QuantumConnect matches South Side Chicago residents with local mentors and builds a training roadmap toward jobs created by the Illinois Quantum and Microelectronics Park.",
  /** Small print under the wordmark. */
  org: "Black CS Success Summit 2026",
  nav: [...baseNav, ...kitNav()],
  /** The main call to action in the header. */
  cta: { label: "Find a mentor", href: "/match" },
  links: {
    repo: "https://github.com/",
    nextDocs: "https://nextjs.org/docs",
    shadcn: "https://ui.shadcn.com",
    claudeCode: "https://docs.claude.com/en/docs/claude-code/overview",
  },
} as const;

export type Site = typeof site;
