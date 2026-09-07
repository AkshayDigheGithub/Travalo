"use client";

import * as React from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  addDays,
  formatLongDate,
  isoToLocalDate,
  localDateToIso,
  todayIso,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

import "react-day-picker/style.css";

const dayPickerClassNames = {
  root: "rdp-tripora",
  months: "flex flex-col sm:flex-row gap-6",
  month_caption: "flex justify-center pb-3 text-sm font-semibold text-ink",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted disabled:opacity-30",
  button_next:
    "grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted disabled:opacity-30",
  weekday: "size-10 text-[11px] font-medium uppercase text-ink-subtle",
  day: "p-0",
  day_button:
    "size-10 rounded-full text-sm text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-ink-subtle/50 disabled:hover:bg-transparent",
  selected: "[&_button]:bg-brand-600 [&_button]:text-white [&_button]:hover:bg-brand-700",
  range_middle: "bg-brand-50 [&_button]:bg-transparent [&_button]:text-brand-900 rounded-none",
  range_start: "rounded-l-full bg-brand-50",
  range_end: "rounded-r-full bg-brand-50",
  today: "[&_button]:font-semibold [&_button]:text-brand-700",
  outside: "opacity-0 pointer-events-none",
};

type BaseProps = {
  id: string;
  /** How far ahead a date may be chosen. */
  maxMonths?: number;
  className?: string;
  error?: string;
};

export type DateRangePickerProps = BaseProps & {
  mode: "range";
  startLabel: string;
  endLabel: string;
  start: string;
  end?: string;
  onChange: (value: { start: string; end?: string }) => void;
};

export type SingleDatePickerProps = BaseProps & {
  mode: "single";
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateRangePicker(props: DateRangePickerProps | SingleDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const today = todayIso();

  const disabled = { before: isoToLocalDate(today) };
  const endMonth = isoToLocalDate(addDays(today, 30 * (props.maxMonths ?? 12)));

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={props.id}
            // aria-invalid isn't supported on role="button"; the message below
            // is linked with aria-describedby and announced as an alert.
            aria-describedby={props.error ? `${props.id}-error` : undefined}
            className={cn("group flex w-full items-center gap-3 text-left", props.className)}
          >
            <CalendarDays className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            {props.mode === "single" ? (
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
                  {props.label}
                </span>
                <span className="block truncate text-base font-medium text-ink">
                  {formatLongDate(props.value)}
                </span>
              </span>
            ) : (
              <span className="grid min-w-0 flex-1 grid-cols-2 gap-3">
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
                    {props.startLabel}
                  </span>
                  <span className="block truncate text-base font-medium text-ink">
                    {formatLongDate(props.start)}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
                    {props.endLabel}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-base font-medium",
                      props.end ? "text-ink" : "text-ink-subtle",
                    )}
                  >
                    {props.end ? formatLongDate(props.end) : "Add date"}
                  </span>
                </span>
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto max-w-[calc(100vw-1.5rem)] p-4" align="start">
          {props.mode === "single" ? (
            <DayPicker
              mode="single"
              required
              autoFocus
              selected={isoToLocalDate(props.value)}
              defaultMonth={isoToLocalDate(props.value)}
              disabled={disabled}
              endMonth={endMonth}
              numberOfMonths={isDesktop ? 2 : 1}
              classNames={dayPickerClassNames}
              onSelect={(date) => {
                if (!date) return;
                props.onChange(localDateToIso(date));
                setOpen(false);
              }}
            />
          ) : (
            <DayPicker
              mode="range"
              autoFocus
              selected={{
                from: isoToLocalDate(props.start),
                to: props.end ? isoToLocalDate(props.end) : undefined,
              }}
              defaultMonth={isoToLocalDate(props.start)}
              disabled={disabled}
              endMonth={endMonth}
              numberOfMonths={isDesktop ? 2 : 1}
              classNames={dayPickerClassNames}
              onSelect={(range: DateRange | undefined) => {
                if (!range?.from) return;
                const start = localDateToIso(range.from);
                const end = range.to ? localDateToIso(range.to) : undefined;
                props.onChange({ start, end });
                // Close once the range is complete so the form stays quick to fill.
                if (end && end !== start) setOpen(false);
              }}
            />
          )}
          <p className="mt-2 border-t border-line pt-3 text-xs text-ink-subtle">
            Dates in the past can&apos;t be selected.
          </p>
        </PopoverContent>
      </Popover>

      {props.error ? (
        <p id={`${props.id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}
