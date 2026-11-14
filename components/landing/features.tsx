import {
  GaugeIcon,
  MessageCircleIcon,
  RouteIcon,
  ShieldCheckIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";
import { Container, Section } from "@/components/container";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const features = [
  {
    icon: TargetIcon,
    title: "Start with your goal",
    text: "Pick the kind of job you want, the skills you have and the ones you want to learn.",
  },
  {
    icon: UsersIcon,
    title: "Meet local mentors",
    text: "Browse one mentor at a time: people from nearby neighborhoods who already do the work.",
  },
  {
    icon: GaugeIcon,
    title: "See why you matched",
    text: "Every card shows a score out of 100 and the reasons behind it. No black box.",
  },
  {
    icon: MessageCircleIcon,
    title: "Connect and say hello",
    text: "When you match, you get a first message to send so the conversation is easy to start.",
  },
  {
    icon: RouteIcon,
    title: "Get a roadmap",
    text: "An AI assistant turns your goal into a few clear steps, using real Chicago training programs.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safe by design",
    text: "First names only, no photos, no contact details. The score ignores race, gender and age.",
  },
];

/** Six feature cards; the grid changes character with the `layout` axis. */
export function Features() {
  return (
    <Section id="features">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="How it works"
          title="A person who made it, showing you how."
        >
          The quantum park brings jobs in tech, trades and services.
          QuantumConnect helps South Side residents reach them.
        </SectionHeading>
        <ul
          className={cn(
            "grid gap-stack sm:grid-cols-2 lg:grid-cols-3",
            "layout-editorial:gap-0 layout-editorial:sm:grid-cols-1 layout-editorial:lg:grid-cols-2 layout-editorial:lg:gap-x-12",
            "layout-bento:lg:grid-cols-4",
          )}
        >
          {features.map((feature, i) => (
            <li
              key={feature.title}
              className={cn(
                "surface flex flex-col gap-4 rounded-card p-card",
                "layout-centered:items-center layout-centered:text-center",
                "layout-editorial:grid layout-editorial:grid-cols-[2.5rem_1fr] layout-editorial:gap-x-4 layout-editorial:gap-y-1 layout-editorial:rounded-none layout-editorial:border-0 layout-editorial:border-b layout-editorial:bg-transparent layout-editorial:px-0 layout-editorial:py-6 layout-editorial:shadow-none layout-editorial:backdrop-blur-none",
                i === 0 &&
                  "layout-bento:bg-primary layout-bento:text-primary-foreground layout-bento:lg:col-span-2 layout-bento:lg:row-span-2 layout-bento:lg:justify-end",
                i >= 3 && "layout-bento:lg:col-span-2",
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-control bg-primary-tint text-primary-text layout-editorial:row-span-2 layout-editorial:size-auto layout-editorial:bg-transparent layout-editorial:font-mono layout-editorial:text-sm">
                <feature.icon
                  className={cn(
                    "size-5 layout-editorial:hidden",
                    i === 0 && "layout-bento:text-primary-foreground",
                  )}
                  aria-hidden
                />
                <span className="hidden layout-editorial:inline">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <h3
                className={cn("text-xl", i === 0 && "layout-bento:lg:text-4xl")}
              >
                {feature.title}
              </h3>
              <p
                className={cn(
                  "text-muted-foreground layout-editorial:col-start-2",
                  i === 0 && "layout-bento:text-primary-foreground",
                )}
              >
                {feature.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
