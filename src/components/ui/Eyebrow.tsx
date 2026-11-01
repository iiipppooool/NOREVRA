import { cn } from "@/lib/utils";

/**
 * Section marker: an index numeral, a hairline, and a short label. Used instead
 * of a decorative heading, because a furniture catalogue numbers its sections.
 */
export function Eyebrow({
  index,
  children,
  className,
  tone = "ink",
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "ink" | "light";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        tone === "light" ? "text-alabaster/75" : "text-smoke",
        className,
      )}
    >
      {index && (
        <span className="label tabular-nums" data-numeric>
          {index}
        </span>
      )}
      <span
        aria-hidden
        className={cn("h-px w-10", tone === "light" ? "bg-alabaster/40" : "bg-hairline")}
      />
      <span className="label">{children}</span>
    </div>
  );
}
