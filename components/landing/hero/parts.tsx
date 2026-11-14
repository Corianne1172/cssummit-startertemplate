import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hero, jobFields, matchPreview } from "../content";

/** Shared pieces of the four hero layouts. */

export function HeroTitle({ className }: { className?: string }) {
  return (
    <h1 className={cn("text-display", className)}>
      {hero.titleStart} <em>{hero.titleEm}</em> {hero.titleEnd}
    </h1>
  );
}

export function HeroLede({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl",
        className,
      )}
    >
      {hero.lede}
    </p>
  );
}

export function HeroActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <Button asChild size="lg">
        <Link href={hero.primary.href}>
          {hero.primary.label}
          <ArrowRightIcon />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href={hero.secondary.href}>{hero.secondary.label}</Link>
      </Button>
    </div>
  );
}

/** A small readout of one sample match. */
export function TerminalCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "surface overflow-hidden rounded-card font-mono text-[0.8125rem] sm:text-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-chart-1" />
        <span className="size-2.5 rounded-full bg-chart-4" />
        <span className="size-2.5 rounded-full bg-chart-3" />
        <span className="ml-2 text-xs text-muted-foreground">match score</span>
      </div>
      <ul className="flex flex-col gap-2 p-5">
        {matchPreview.map((line) => (
          <li
            key={line.text}
            className={cn(
              "break-words",
              line.prompt ? "text-foreground" : "text-muted-foreground",
              line.text.startsWith("✔") && "text-success",
            )}
          >
            {line.prompt ? (
              <span className="mr-2 text-primary-text">$</span>
            ) : null}
            {line.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KitChips({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {jobFields.map((kit) => (
        <li
          key={kit.name}
          className="inline-flex items-center gap-2 rounded-badge border bg-card/60 px-3 py-1.5 text-sm"
        >
          <kit.icon className="size-4 text-primary-text" aria-hidden />
          {kit.title}
        </li>
      ))}
    </ul>
  );
}
