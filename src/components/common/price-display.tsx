import { formatMoney } from "@/lib/currency";
import type { CurrencyCode } from "@/config/currencies";
import { cn } from "@/lib/utils/cn";

/**
 * Prices are shown exactly as the supplier quoted them. When we had to convert
 * a price ourselves it is labelled "Estimated" so a converted figure is never
 * mistaken for the supplier's own.
 */
export function PriceDisplay({
  amount,
  currency,
  source = "provider",
  caption,
  size = "md",
  className,
}: {
  amount: number;
  currency: CurrencyCode;
  source?: "provider" | "converted";
  caption?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl sm:text-3xl",
  } as const;

  return (
    <div className={cn("text-right", className)}>
      {source === "converted" ? (
        <span className="block text-[11px] font-medium text-ink-subtle">Estimated</span>
      ) : null}
      <span className={cn("font-semibold tracking-tight text-ink tabular-nums", sizes[size])}>
        {formatMoney(amount, currency)}
      </span>
      {caption ? <span className="block text-xs text-ink-subtle">{caption}</span> : null}
    </div>
  );
}
