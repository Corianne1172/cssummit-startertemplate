import {
  AtomIcon,
  BrainCircuitIcon,
  ChartColumnIcon,
  CodeIcon,
  HardHatIcon,
  type LucideIcon,
  ShieldCheckIcon,
  UtensilsIcon,
  WrenchIcon,
} from "lucide-react";

/** Landing page copy. Short and concrete: no invented numbers. */
export const hero = {
  eyebrow: "South Side Chicago",
  titleStart: "Find a",
  titleEm: "mentor",
  titleEnd: "for the jobs coming to South Works.",
  lede: "The Illinois Quantum and Microelectronics Park is being built on the former U.S. Steel South Works site on Chicago's South Side. QuantumConnect matches residents with local professionals who mentor them, and builds a step-by-step training roadmap. Demo profiles are fictional.",
  primary: { label: "Find a mentor", href: "/match" },
  secondary: { label: "Build my roadmap", href: "/chat" },
};

export type JobField = { name: string; title: string; icon: LucideIcon };

/** Job fields that come with the quantum park. Most are not physics jobs. */
export const jobFields: JobField[] = [
  { name: "quantum", title: "Quantum tech", icon: AtomIcon },
  { name: "software", title: "Software", icon: CodeIcon },
  { name: "security", title: "Cybersecurity", icon: ShieldCheckIcon },
  { name: "data", title: "Data science", icon: ChartColumnIcon },
  { name: "ai", title: "AI", icon: BrainCircuitIcon },
  { name: "construction", title: "Construction", icon: HardHatIcon },
  { name: "facilities", title: "Facilities", icon: WrenchIcon },
  { name: "hospitality", title: "Catering", icon: UtensilsIcon },
];

/** A sample match, shown as a small readout in some hero layouts. */
export const matchPreview = [
  { prompt: true, text: "match maya --with mentors" },
  { prompt: false, text: "◆ Shared focus › quantum computing, data science" },
  { prompt: false, text: "◆ Can teach › SQL, interviewing" },
  { prompt: false, text: "◆ Free when you are › Saturday" },
  { prompt: false, text: "✔ 69% match. Say hello" },
];
