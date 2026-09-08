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
  root: "rdp-bookmyflight",
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
  /**
   * A range being picked, before it is handed to the form.
   *
   * The calendar always arrives with a complete range, and a complete range
   * makes every click an adjustment of the end date — which is why the start
   * date could not be moved forward. `resetOnSelect` makes the first click
   * start a new range instead, and holding that range here until it is finished
   * keeps a form that fills in its own end date (hotels do) from immediately
   * completing it again and swallowing the next click.
   */
  const [draft, setDraft] = React.useState<DateRange | undefined>(undefined);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const today = todayIso();

  const disabled = { before: isoToLocalDate(today) };
  const endMonth = isoToLocalDate(addDays(today, 30 * (props.maxMonths ?? 12)));

  const range: DateRange | undefined =
    props.mode === "range"
      ? (draft ?? {
          from: isoToLocalDate(props.start),
          to: props.end ? isoToLocalDate(props.end) : undefined,
        })
      : undefined;

  // The trigger follows the pick in progress, so choosing a departure shows
  // straight away that a return is still needed.
  const displayStart = range?.from ? localDateToIso(range.from) : undefined;
  const displayEnd = range?.to ? localDateToIso(range.to) : undefined;

  function closePicker(next: boolean) {
    setOpen(next);
    if (next) return;
    // A half-finished pick is still the traveller's choice: keep the new start
    // and let the form ask for the date that is missing.
    if (props.mode === "range" && draft?.from && !draft.to) {
      props.onChange({ start: localDateToIso(draft.from), end: undefined });
    }
    setDraft(undefined);
  }

  return (
    <div>
      <Popover open={open} onOpenChange={closePicker}>
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
                    {formatLongDate(displayStart ?? props.start)}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
                    {props.endLabel}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-base font-medium",
                      displayEnd ? "text-ink" : "text-ink-subtle",
                    )}
                  >
                    {displayEnd ? formatLongDate(displayEnd) : "Add date"}
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
              resetOnSelect
              required
              selected={range}
              defaultMonth={range?.from ?? isoToLocalDate(props.start)}
              disabled={disabled}
              endMonth={endMonth}
              numberOfMonths={isDesktop ? 2 : 1}
              classNames={dayPickerClassNames}
              onSelect={(next: DateRange | undefined) => {
                if (!next?.from) return;
                if (!next.to) {
                  // First click: the new start. The end comes with the next one.
                  setDraft(next);
                  return;
                }
                props.onChange({
                  start: localDateToIso(next.from),
                  end: localDateToIso(next.to),
                });
                setDraft(undefined);
                // Close once the range is complete so the form stays quick to fill.
                setOpen(false);
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
