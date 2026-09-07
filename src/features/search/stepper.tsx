"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Labelled +/- control. Both buttons carry text labels for screen readers. */
export function Stepper({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-2.5", className)}>
      <span>
        <span id={`${id}-label`} className="block text-sm font-medium text-ink">
          {label}
        </span>
        {hint ? <span className="block text-xs text-ink-subtle">{hint}</span> : null}
      </span>

      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="grid size-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-line-strong disabled:opacity-35"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <output
          aria-labelledby={`${id}-label`}
          className="w-8 text-center text-sm font-semibold text-ink tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="grid size-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-line-strong disabled:opacity-35"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
