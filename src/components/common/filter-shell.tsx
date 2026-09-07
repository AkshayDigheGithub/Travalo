"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

/** A titled block inside a filter panel. */
export function FilterGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-line px-5 py-5 first:border-t-0">
      <legend className="sr-only">{title}</legend>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-0.5 text-xs text-ink-subtle">{description}</p> : null}
      <div className="mt-3.5">{children}</div>
    </fieldset>
  );
}

export function FilterPanelShell({
  activeCount,
  onReset,
  children,
  className,
}: {
  activeCount: number;
  onReset: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-panel border border-line bg-surface", className)}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Filters</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            Clear all ({activeCount})
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Bottom sheet that hosts the same filter panel on small screens. */
export function MobileFilters({
  activeCount,
  resultLabel,
  children,
}: {
  activeCount: number;
  resultLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" title="Filters">
        <div className="pb-24">{children}</div>
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
            Show {resultLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SortDropdown<T extends string>({
  value,
  options,
  onChange,
  label = "Sort by",
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
  label?: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <SelectTrigger aria-label={label} className="h-9 w-auto min-w-40 rounded-full text-sm">
        <span className="text-ink-subtle">Sort:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Checkbox row used across both filter panels. */
export function CheckRow({
  id,
  label,
  hint,
  checked,
  onChange,
  count,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ink">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4.5 shrink-0 accent-[var(--color-brand-600)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {hint ? <span className="block text-xs text-ink-subtle">{hint}</span> : null}
      </span>
      {count !== undefined ? (
        <span className="shrink-0 text-xs text-ink-subtle tabular-nums">{count}</span>
      ) : null}
    </label>
  );
}
