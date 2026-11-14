import Link from "next/link";
import { cn } from "@/lib/utils";

const sizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" } as const;

/** The project wordmark, with a short line under it. Rename in lib/site.ts. */
export function Brand({
  href = "/",
  size = "md",
  showName = true,
  className,
}: {
  href?: string;
  size?: keyof typeof sizes;
  showName?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-w-0 flex-col items-start gap-1 rounded-sm",
        className,
      )}
    >
      <span
        className={cn(
          "font-heading leading-none font-bold tracking-tight",
          sizes[size],
        )}
      >
        Quantum<span className="text-primary-text">Connect</span>
      </span>
      {showName ? (
        <span className="truncate font-mono text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors group-hover:text-primary-text">
          South Side mentors
        </span>
      ) : null}
    </Link>
  );
}
