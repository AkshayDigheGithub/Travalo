"use client";

import { CheckRow, FilterGroup, FilterPanelShell } from "@/components/common/filter-shell";
import { Slider } from "@/components/ui/slider";
import { formatMoney } from "@/lib/currency";
import { formatDuration } from "@/lib/utils/date";
import type { CurrencyCode } from "@/config/currencies";
import type { Airline, FlightResult } from "@/types/flight";
import {
  DEPARTURE_WINDOWS,
  EMPTY_FLIGHT_FILTERS,
  countActiveFlightFilters,
  stopsLabel,
  type DepartureWindowId,
  type FlightFilters,
} from "./filtering";

const STOP_BUCKETS = [0, 1, 2];

export function FlightFilterPanel({
  filters,
  onChange,
  airlines,
  results,
  currency,
  priceRange,
  durationRange,
  onFilterUsed,
}: {
  filters: FlightFilters;
  onChange: (next: FlightFilters) => void;
  airlines: Airline[];
  results: FlightResult[];
  currency: CurrencyCode;
  priceRange: { min: number; max: number } | null;
  durationRange: { min: number; max: number } | null;
  onFilterUsed?: (facet: string) => void;
}) {
  function patch(next: Partial<FlightFilters>, facet: string) {
    onChange({ ...filters, ...next });
    onFilterUsed?.(facet);
  }

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
  }

  const stopCounts = new Map<number, number>();
  for (const result of results) {
    const bucket = Math.min(result.stops, 2);
    stopCounts.set(bucket, (stopCounts.get(bucket) ?? 0) + 1);
  }

  const airlineCounts = new Map<string, number>();
  for (const result of results) {
    airlineCounts.set(result.airline.code, (airlineCounts.get(result.airline.code) ?? 0) + 1);
  }

  return (
    <FilterPanelShell
      activeCount={countActiveFlightFilters(filters)}
      onReset={() => onChange(EMPTY_FLIGHT_FILTERS)}
    >
      <FilterGroup title="Stops">
        {STOP_BUCKETS.filter((bucket) => stopCounts.has(bucket)).map((bucket) => (
          <CheckRow
            key={bucket}
            id={`stops-${bucket}`}
            label={bucket === 2 ? "2+ stops" : stopsLabel(bucket)}
            checked={filters.stops.includes(bucket)}
            count={stopCounts.get(bucket)}
            onChange={() => patch({ stops: toggle(filters.stops, bucket) }, "stops")}
          />
        ))}
      </FilterGroup>

      {priceRange && priceRange.max > priceRange.min ? (
        <FilterGroup title="Price" description="Maximum price per traveller">
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={Math.max(1, Math.round((priceRange.max - priceRange.min) / 60))}
            value={[filters.maxPrice ?? priceRange.max]}
            ariaLabels={["Maximum price"]}
            onValueChange={([value]) => onChange({ ...filters, maxPrice: value })}
            onValueCommit={() => onFilterUsed?.("price")}
          />
          <p className="mt-3 flex justify-between text-xs text-ink-muted tabular-nums">
            <span>{formatMoney(priceRange.min, currency)}</span>
            <span className="font-medium text-ink">
              Up to {formatMoney(filters.maxPrice ?? priceRange.max, currency)}
            </span>
          </p>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Departure time" description="Outbound departure">
        {DEPARTURE_WINDOWS.map((window) => (
          <CheckRow
            key={window.id}
            id={`departure-${window.id}`}
            label={window.label}
            hint={window.hint}
            checked={filters.departureWindows.includes(window.id)}
            onChange={() =>
              patch(
                {
                  departureWindows: toggle<DepartureWindowId>(filters.departureWindows, window.id),
                },
                "departure_time",
              )
            }
          />
        ))}
      </FilterGroup>

      {durationRange && durationRange.max > durationRange.min ? (
        <FilterGroup title="Duration" description="Maximum total travel time">
          <Slider
            min={durationRange.min}
            max={durationRange.max}
            step={15}
            value={[filters.maxDurationMinutes ?? durationRange.max]}
            ariaLabels={["Maximum duration"]}
            onValueChange={([value]) => onChange({ ...filters, maxDurationMinutes: value })}
            onValueCommit={() => onFilterUsed?.("duration")}
          />
          <p className="mt-3 text-xs font-medium text-ink">
            Up to {formatDuration(filters.maxDurationMinutes ?? durationRange.max)}
          </p>
        </FilterGroup>
      ) : null}

      {airlines.length > 1 ? (
        <FilterGroup title="Airlines">
          <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
            {airlines.map((airline) => (
              <CheckRow
                key={airline.code}
                id={`airline-${airline.code}`}
                label={airline.name}
                checked={filters.airlines.includes(airline.code)}
                count={airlineCounts.get(airline.code)}
                onChange={() =>
                  patch({ airlines: toggle(filters.airlines, airline.code) }, "airline")
                }
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}
    </FilterPanelShell>
  );
}
