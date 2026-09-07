"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Plane } from "lucide-react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils/cn";
import type { Place } from "@/types/search";

/**
 * Accessible combobox (WAI-ARIA 1.2 pattern): the input keeps focus and owns
 * `aria-activedescendant`, arrow keys move the highlight, Enter commits and
 * Escape closes. Suggestions are fetched from our own route handler, so the
 * provider token never reaches the browser.
 */
export type PlaceAutocompleteProps = {
  id: string;
  label: string;
  placeholder: string;
  endpoint: "/api/flights/airports" | "/api/hotels/locations";
  value: string;
  /** Human-readable text shown in the input. */
  displayValue: string;
  onSelect: (place: Place) => void;
  onDisplayValueChange: (value: string) => void;
  icon?: "plane" | "pin";
  error?: string;
  autoFocus?: boolean;
  className?: string;
};

export function PlaceAutocomplete({
  id,
  label,
  placeholder,
  endpoint,
  displayValue,
  onSelect,
  onDisplayValueChange,
  icon = "plane",
  error,
  autoFocus,
  className,
}: PlaceAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 200);

  const { data, isFetching } = useQuery({
    queryKey: [endpoint, debouncedQuery],
    enabled: open && debouncedQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(debouncedQuery)}`, {
        signal,
      });
      if (!response.ok) return { results: [] as Place[] };
      return (await response.json()) as { results: Place[] };
    },
  });

  const results = data?.results ?? [];
  const listboxId = `${id}-listbox`;

  React.useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function commit(place: Place) {
    onSelect(place);
    onDisplayValueChange(formatPlace(place));
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        if (results.length === 0) return -1;
        const next = current + delta;
        if (next < 0) return results.length - 1;
        if (next >= results.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter" && open && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      commit(results[activeIndex]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const Icon = icon === "pin" ? MapPin : Plane;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase"
      >
        {label}
      </label>
      <div className="relative mt-1 flex items-center">
        <Icon
          className="pointer-events-none absolute left-0 size-4 text-ink-subtle"
          aria-hidden="true"
        />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={displayValue}
          placeholder={placeholder}
          onChange={(event) => {
            onDisplayValueChange(event.target.value);
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={(event) => {
            event.currentTarget.select();
            if (displayValue.trim().length >= 2) {
              setQuery(displayValue);
              setOpen(true);
            }
          }}
          onKeyDown={onKeyDown}
          className="h-9 w-full border-0 bg-transparent pl-6 text-base font-medium text-ink placeholder:font-normal placeholder:text-ink-subtle focus:outline-none"
        />
        {isFetching ? (
          <Loader2
            className="absolute right-0 size-4 animate-spin text-ink-subtle"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : null}

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 z-50 mt-2 max-h-72 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-float"
        >
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-subtle">
              {debouncedQuery.trim().length < 2
                ? "Type at least two letters"
                : isFetching
                  ? "Searching…"
                  : "No matching places"}
            </li>
          ) : (
            results.map((place, index) => (
              <li
                key={`${place.type}-${place.code}`}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(place)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    index === activeIndex ? "bg-surface-muted" : "hover:bg-surface-muted",
                  )}
                >
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    {place.type === "city" ? (
                      <MapPin className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Plane className="size-3.5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {place.cityName}
                      {place.countryName ? (
                        <span className="font-normal text-ink-subtle">, {place.countryName}</span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">{place.name}</span>
                  </span>
                  {place.type === "airport" ? (
                    <span className="mt-0.5 shrink-0 rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
                      {place.code}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

export function formatPlace(place: Place): string {
  return place.type === "airport" ? `${place.cityName} (${place.code})` : place.cityName;
}
