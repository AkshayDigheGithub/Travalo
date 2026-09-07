"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { CalendarClock } from "lucide-react";

import { MobileFilters, SortDropdown } from "@/components/common/filter-shell";
import { FlightCardSkeleton, SearchProgress } from "@/components/common/loading-skeleton";
import { MockDataNotice } from "@/components/common/mock-notice";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { CABIN_LABELS } from "@/lib/validation/flights";
import { formatShortDate } from "@/lib/utils/date";
import { flightSearchQuery, type FlightSearchState } from "@/lib/utils/search-params";
import type { DateFlexibility, FlightSearchResponse } from "@/types/flight";
import { FlightCard } from "./flight-card";
import { FlightFilterPanel } from "./flight-filters";
import {
  EMPTY_FLIGHT_FILTERS,
  FLIGHT_SORT_OPTIONS,
  applyFlightFilters,
  countActiveFlightFilters,
  sortFlights,
  type FlightFilters,
  type FlightSortId,
} from "./filtering";

type ApiError = { error?: { message?: string } };

export function FlightResults({ state }: { state: FlightSearchState }) {
  const query = flightSearchQuery(state);
  const [filters, setFilters] = React.useState<FlightFilters>(EMPTY_FLIGHT_FILTERS);
  const [sort, setSort] = React.useState<FlightSortId>("recommended");

  const { data, isPending, isError, error, refetch, isFetching } = useQuery<
    FlightSearchResponse,
    Error
  >({
    queryKey: ["flights", query],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/flights/search?${query}`, { signal });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiError;
        throw new Error(body.error?.message ?? "We couldn't complete that search.");
      }
      return (await response.json()) as FlightSearchResponse;
    },
  });

  React.useEffect(() => {
    if (data) {
      track("flight_result_view", {
        from: state.from,
        to: state.to,
        results: data.results.length,
      });
    }
  }, [data, state.from, state.to]);

  const results = React.useMemo(() => data?.results ?? [], [data]);
  const visible = React.useMemo(
    () => sortFlights(applyFlightFilters(results, filters), sort),
    [results, filters, sort],
  );

  const travellers = state.adults + state.children + state.infants;
  const activeFilters = countActiveFlightFilters(filters);

  const filterPanel = data ? (
    <FlightFilterPanel
      filters={filters}
      onChange={setFilters}
      airlines={data.airlines}
      results={results}
      currency={data.currency}
      priceRange={data.priceRange}
      durationRange={data.durationRange}
      onFilterUsed={(facet) => track("filter_used", { vertical: "flight", facet })}
    />
  ) : null;

  if (isPending) return <LoadingState />;

  if (isError) {
    return (
      <div className="container-page py-10">
        <ErrorState description={error.message} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="container-page py-6 lg:py-8">
      {data.isMock ? <MockDataNotice className="mb-5" /> : null}

      {results.length > 0 && data.dateFlexibility !== "exact" ? (
        <NearbyDatesNotice flexibility={data.dateFlexibility} state={state} className="mb-5" />
      ) : null}

      {state.cabin !== "economy" ? (
        <p className="mb-5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
          Prices shown are the lowest available fares for this route.{" "}
          <span className="text-ink">{CABIN_LABELS[state.cabin]}</span> availability and pricing are
          confirmed on the partner site.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" aria-live="polite">
              <span className="font-medium text-ink">{visible.length}</span>{" "}
              {visible.length === 1 ? "result" : "results"}
              {activeFilters > 0 ? ` of ${results.length}` : ""}
              {isFetching ? " · updating…" : ""}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters
                activeCount={activeFilters}
                resultLabel={`${visible.length} ${visible.length === 1 ? "result" : "results"}`}
              >
                {filterPanel}
              </MobileFilters>
              <SortDropdown
                value={sort}
                options={FLIGHT_SORT_OPTIONS}
                onChange={(next) => {
                  setSort(next);
                  track("sort_used", { vertical: "flight", sort: next });
                }}
              />
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="We couldn't find any flights."
              description={
                state.directOnly
                  ? "We looked at nearby dates too. Try turning off the non-stop filter, another airport, or a different month."
                  : "We looked at nearby dates too. Try another airport or a different month."
              }
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="No flights match these filters."
              description="Loosen a filter to see more of the results we found."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters(EMPTY_FLIGHT_FILTERS)}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((result) => (
                <li key={result.id}>
                  <FlightCard result={result} travellers={travellers} />
                </li>
              ))}
            </ul>
          )}

          {results.length > 0 ? (
            <p className="mt-6 text-xs leading-relaxed text-ink-subtle">
              Prices are per traveller and include taxes and fees where the provider reports them.
              Final price, baggage allowance and conditions are confirmed on the provider&apos;s
              site before you pay.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Shown when the provider had no fares for the requested dates and the search
 * fell back to nearby ones. Every card carries its own dates, so this explains
 * why they differ rather than standing in for them.
 */
function NearbyDatesNotice({
  flexibility,
  state,
  className,
}: {
  flexibility: Exclude<DateFlexibility, "exact">;
  state: FlightSearchState;
  className?: string;
}) {
  const requested =
    state.return && flexibility === "flexible-return"
      ? formatShortDate(state.return)
      : `${formatShortDate(state.departure)}${state.return ? ` – ${formatShortDate(state.return)}` : ""}`;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted ${className ?? ""}`}
      role="status"
    >
      <CalendarClock className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      <p>
        {flexibility === "flexible-return" ? (
          <>
            <span className="font-medium text-ink">No fares for a return on {requested}.</span>{" "}
            These leave on {formatShortDate(state.departure)} as you asked and come back on the
            nearest dates we could price.
          </>
        ) : (
          <>
            <span className="font-medium text-ink">No fares for {requested}.</span> These are the
            closest dates we could price — check each result&apos;s dates before you book.
          </>
        )}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container-page py-6 lg:py-8">
      <SearchProgress message="Searching travel options… finding the best available deals." />
      <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="space-y-4 rounded-panel border border-line bg-surface p-5">
            {[0, 1, 2, 3].map((group) => (
              <div key={group} className="space-y-2">
                <div className="h-4 w-24 animate-shimmer rounded bg-surface-muted" />
                <div className="h-3 w-full animate-shimmer rounded bg-surface-muted" />
                <div className="h-3 w-4/5 animate-shimmer rounded bg-surface-muted" />
              </div>
            ))}
          </div>
        </aside>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <FlightCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
