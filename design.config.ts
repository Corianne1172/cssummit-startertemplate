import type { DesignConfig } from "@/lib/design";

/**
 * This project's look: one option per axis.
 * Options are listed in lib/design.ts (AXES). Preview combinations with the design switcher
 * (bottom-right corner in development), then paste its "Copy config" output here.
 */
const design: DesignConfig = {
  shape: "soft",
  buttons: "glow",
  surface: "glass",
  type: "display",
  layout: "centered",
  nav: "floating",
  density: "comfortable",
  accent: "teal",
};

export default design;
