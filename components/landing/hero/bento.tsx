import { PaletteIcon, SparklesIcon } from "lucide-react";
import { Container } from "@/components/container";
import { hero, jobFields } from "../content";
import { HeroActions, HeroLede, HeroTitle, TerminalCard } from "./parts";

/** layout="bento": the hero is a grid of tiles, one idea per tile. */
export function HeroBento() {
  return (
    <section className="py-section">
      <Container className="grid auto-rows-[minmax(9rem,auto)] gap-4 md:grid-cols-6">
        <div className="surface flex flex-col justify-end gap-6 rounded-card p-card md:col-span-4 md:row-span-2 md:p-10">
          <p className="eyebrow">{hero.eyebrow}</p>
          <HeroTitle className="text-[clamp(2.5rem,6vw,4.75rem)]" />
          <HeroLede />
          <HeroActions />
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-card bg-primary p-card text-primary-foreground md:col-span-2">
          <SparklesIcon className="size-6" aria-hidden />
          <div>
            <p className="font-heading text-5xl leading-none font-bold">
              {jobFields.length}
            </p>
            <p className="mt-2 font-medium">
              job fields coming with the park. Most are not physics jobs.
            </p>
          </div>
        </div>
        <div className="surface flex flex-col justify-between gap-4 rounded-card p-card md:col-span-2">
          <PaletteIcon className="size-6 text-primary-text" aria-hidden />
          <div>
            <p className="font-heading text-5xl leading-none font-bold">8</p>
            <p className="mt-2 text-muted-foreground">
              design axes, six presets and a Shuffle button.
            </p>
          </div>
        </div>
        <TerminalCard className="md:col-span-3" />
        <div className="surface flex flex-col justify-center gap-3 rounded-card p-card md:col-span-3">
          <p className="font-mono text-sm text-primary-text">claude</p>
          <p className="text-2xl font-semibold text-balance">
            “Add a leaderboard page for our game.”
          </p>
          <p className="text-sm text-muted-foreground">
            Claude Code ships with project rules and skills, so it builds the
            way this template does.
          </p>
        </div>
      </Container>
    </section>
  );
}
