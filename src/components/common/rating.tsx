import { Star } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Official star rating. Rendered with text as well as icons, never icons alone. */
export function StarRating({ stars, className }: { stars: number; className?: string }) {
  const rounded = Math.round(stars);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rounded}-star property`}
    >
      {Array.from({ length: rounded }).map((_, index) => (
        <Star key={index} className="size-3.5 fill-accent-500 text-accent-500" aria-hidden="true" />
      ))}
    </span>
  );
}

const SCORE_LABELS: [number, string][] = [
  [9, "Exceptional"],
  [8.5, "Excellent"],
  [8, "Very good"],
  [7, "Good"],
  [0, "Guest score"],
];

/** Guest score on a 0–10 scale, with the wording that goes with it. */
export function GuestScore({
  score,
  reviewCount,
  className,
}: {
  score: number;
  reviewCount?: number;
  className?: string;
}) {
  const label = SCORE_LABELS.find(([threshold]) => score >= threshold)?.[1] ?? "Guest score";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white tabular-nums">
        {score.toFixed(1)}
      </span>
      <span className="text-xs text-ink-muted">
        <span className="font-medium text-ink">{label}</span>
        {reviewCount ? ` · ${reviewCount.toLocaleString()} reviews` : null}
      </span>
    </span>
  );
}
