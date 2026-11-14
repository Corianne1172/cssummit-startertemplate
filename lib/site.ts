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
  { label: "Styleguide", href: "/styleguide" },
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
  tagline: "Build something real this weekend.",
  description:
    "A hackathon starter for the Black CS Success Summit: Next.js, a switchable design system, opt-in kits and Claude Code, ready on the first run.",
  /** Small print under the wordmark. */
  org: "Chi Tech CLLCT",
  nav: [...baseNav, ...kitNav()],
  /** The main call to action in the header. */
  cta: { label: "Get started", href: "/#get-started" },
  links: {
    repo: "https://github.com/",
    nextDocs: "https://nextjs.org/docs",
    shadcn: "https://ui.shadcn.com",
    claudeCode: "https://docs.claude.com/en/docs/claude-code/overview",
  },
} as const;

export type Site = typeof site;
