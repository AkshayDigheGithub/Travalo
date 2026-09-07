"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { findAirport } from "@/config/airports";
import { DateRangePicker } from "@/features/search/date-range-picker";
import { PlaceAutocomplete, formatPlace } from "@/features/search/place-autocomplete";
import { TravellerSelector } from "@/features/search/traveller-selector";
import { useCurrency } from "@/hooks/use-currency";
import { track } from "@/lib/analytics/client";
import { addDays, isPastDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { flightResultsHref, type FlightSearchState } from "@/lib/utils/search-params";
import type { TripType } from "@/types/search";

const TRIP_TYPE_OPTIONS: { value: TripType; label: string }[] = [
  { value: "round-trip", label: "Round trip" },
  { value: "one-way", label: "One way" },
  { value: "multi-city", label: "Multi-city" },
];

type Errors = Partial<Record<"from" | "to" | "departure" | "return", string>>;

export function FlightSearchForm({
  initialState,
  onSubmitted,
  compact = false,
}: {
  initialState: FlightSearchState;
  onSubmitted?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { currency } = useCurrency();
  const [state, setState] = React.useState<FlightSearchState>(initialState);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [fromText, setFromText] = React.useState(() => labelForCode(initialState.from));
  const [toText, setToText] = React.useState(() => labelForCode(initialState.to));

  function update(patch: Partial<FlightSearchState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function swap() {
    setState((current) => ({ ...current, from: current.to, to: current.from }));
    setFromText(toText);
    setToText(fromText);
  }

  function validate(next: FlightSearchState): Errors {
    const found: Errors = {};
    if (!/^[A-Z]{3}$/.test(next.from)) found.from = "Choose a departure airport.";
    if (!/^[A-Z]{3}$/.test(next.to)) found.to = "Choose a destination airport.";
    if (next.from && next.from === next.to) found.to = "Choose a different destination.";
    if (isPastDate(next.departure)) found.departure = "Departure can't be in the past.";
    if (next.tripType === "round-trip") {
      if (!next.return) found.return = "Add a return date.";
      else if (next.return < next.departure) found.return = "Return must be after departure.";
    }
    return found;
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = { ...state, currency };
    const found = validate(next);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    track("flight_search", {
      from: next.from,
      to: next.to,
      tripType: next.tripType,
      cabin: next.cabin,
    });
    onSubmitted?.();
    router.push(flightResultsHref(next));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Trip type</legend>
        {TRIP_TYPE_OPTIONS.map((option) => {
          const active = state.tripType === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-ink text-white" : "bg-surface-muted text-ink-muted hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="tripType"
                value={option.value}
                checked={active}
                onChange={() =>
                  update({
                    tripType: option.value,
                    return:
                      option.value === "one-way"
                        ? undefined
                        : (state.return ?? addDays(state.departure, 7)),
                  })
                }
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </fieldset>

      {state.tripType === "multi-city" ? (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-muted">
          Multi-city itineraries are built on the partner site. Enter your first leg below and
          you&apos;ll be able to add further legs when you continue.
        </p>
      ) : null}

      <div
        className={cn(
          "grid gap-px overflow-visible rounded-panel bg-line",
          compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1.15fr_1.15fr_1.3fr_1fr_auto]",
        )}
      >
        <Field className={cn(compact ? "rounded-t-panel" : "lg:rounded-l-panel")}>
          <div className="relative">
            <PlaceAutocomplete
              id="flight-from"
              label="From"
              placeholder="City or airport"
              endpoint="/api/flights/airports"
              value={state.from}
              displayValue={fromText}
              onDisplayValueChange={setFromText}
              onSelect={(place) => {
                update({ from: place.code });
                setErrors((current) => ({ ...current, from: undefined }));
              }}
              error={errors.from}
            />
            {!compact ? (
              <button
                type="button"
                onClick={swap}
                aria-label="Swap origin and destination"
                className="absolute -right-7 bottom-1 z-10 hidden size-9 place-items-center rounded-full border border-line bg-surface text-ink-muted shadow-sm transition-colors hover:text-ink lg:grid"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </Field>

        <Field>
          <PlaceAutocomplete
            id="flight-to"
            label="To"
            placeholder="City or airport"
            endpoint="/api/flights/airports"
            value={state.to}
            displayValue={toText}
            onDisplayValueChange={setToText}
            onSelect={(place) => {
              update({ to: place.code });
              setErrors((current) => ({ ...current, to: undefined }));
            }}
            error={errors.to}
          />
        </Field>

        <Field>
          {state.tripType === "one-way" ? (
            <DateRangePicker
              id="flight-departure"
              mode="single"
              label="Departure"
              value={state.departure}
              error={errors.departure}
              onChange={(value) => update({ departure: value })}
            />
          ) : (
            <DateRangePicker
              id="flight-dates"
              mode="range"
              startLabel="Departure"
              endLabel="Return"
              start={state.departure}
              end={state.return}
              error={errors.departure ?? errors.return}
              onChange={({ start, end }) => {
                update({ departure: start, return: end });
                setErrors((current) => ({ ...current, departure: undefined, return: undefined }));
              }}
            />
          )}
        </Field>

        <Field>
          <TravellerSelector
            travellers={{ adults: state.adults, children: state.children, infants: state.infants }}
            cabin={state.cabin}
            onTravellersChange={(next) => update(next)}
            onCabinChange={(cabin) => update({ cabin })}
          />
        </Field>

        <div
          className={cn(
            "flex items-center bg-surface p-2",
            compact ? "rounded-b-panel" : "lg:rounded-r-panel",
          )}
        >
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full lg:w-auto lg:px-6"
          >
            <Search className="size-5" aria-hidden="true" />
            <span className={compact ? "" : "lg:sr-only xl:not-sr-only"}>Search flights</span>
          </Button>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
        <Checkbox
          checked={state.directOnly}
          onCheckedChange={(checked) => update({ directOnly: checked === true })}
        />
        Non-stop flights only
      </label>
    </form>
  );
}

function Field({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "bg-surface px-4 py-3 transition-colors focus-within:bg-brand-50/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

function labelForCode(code: string): string {
  if (!code) return "";
  const airport = findAirport(code);
  return airport
    ? formatPlace({
        code: airport.code,
        type: "airport",
        name: airport.name,
        cityName: airport.city,
        countryName: airport.country,
        countryCode: airport.countryCode,
      })
    : code;
}
