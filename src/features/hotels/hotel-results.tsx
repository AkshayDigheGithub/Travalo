"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { MobileFilters, SortDropdown } from "@/components/common/filter-shell";
import { HotelCardSkeleton, SearchProgress } from "@/components/common/loading-skeleton";
import { MockDataNotice } from "@/components/common/mock-notice";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { hotelSearchQuery, type HotelSearchState } from "@/lib/utils/search-params";
import type { HotelSearchResponse } from "@/types/hotel";
import { HotelCard } from "./hotel-card";
import { HotelFilterPanel } from "./hotel-filters";
import {
  EMPTY_HOTEL_FILTERS,
  HOTEL_SORT_OPTIONS,
  applyHotelFilters,
  countActiveHotelFilters,
  deriveHotelFacets,
  sortHotels,
  type HotelFilters,
  type HotelSortId,
} from "./filtering";

type ApiError = { error?: { message?: string } };

export function HotelResults({ state }: { state: HotelSearchState }) {
  const query = hotelSearchQuery(state);
  const [filters, setFilters] = React.useState<HotelFilters>(EMPTY_HOTEL_FILTERS);
  const [sort, setSort] = React.useState<HotelSortId>("recommended");

  const { data, isPending, isError, error, refetch, isFetching } = useQuery<
    HotelSearchResponse,
    Error
  >({
    queryKey: ["hotels", query],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/hotels/search?${query}`, { signal });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiError;
        throw new Error(body.error?.message ?? "We couldn't complete that search.");
      }
      return (await response.json()) as HotelSearchResponse;
    },
  });

  React.useEffect(() => {
    if (data) {
      track("hotel_result_view", {
        destination: state.destination,
        results: data.results.length,
      });
    }
  }, [data, state.destination]);

  const results = React.useMemo(() => data?.results ?? [], [data]);
  const facets = React.useMemo(() => deriveHotelFacets(results), [results]);
  const visible = React.useMemo(
    () => sortHotels(applyHotelFilters(results, filters), sort),
    [results, filters, sort],
  );

  const activeFilters = countActiveHotelFilters(filters);

  const filterPanel = data ? (
    <HotelFilterPanel
      filters={filters}
      facets={facets}
      currency={data.currency}
      onChange={setFilters}
      onFilterUsed={(facet) => track("filter_used", { vertical: "hotel", facet })}
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

  function detailsHref(slug: string) {
    const params = new URLSearchParams({
      checkin: state.checkin,
      checkout: state.checkout,
      guests: String(state.guests),
      currency: state.currency,
    });
    return `/hotels/${slug}?${params.toString()}`;
  }

  return (
    <div className="container-page py-6 lg:py-8">
      {data.isMock ? <MockDataNotice className="mb-5" /> : null}

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" aria-live="polite">
              <span className="font-medium text-ink">{visible.length}</span>{" "}
              {visible.length === 1 ? "property" : "properties"}
              {activeFilters > 0 ? ` of ${results.length}` : ""}
              {isFetching ? " · updating…" : ""}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters
                activeCount={activeFilters}
                resultLabel={`${visible.length} ${visible.length === 1 ? "stay" : "stays"}`}
              >
                {filterPanel}
              </MobileFilters>
              <SortDropdown
                value={sort}
                options={HOTEL_SORT_OPTIONS}
                onChange={(next) => {
                  setSort(next);
                  track("sort_used", { vertical: "hotel", sort: next });
                }}
              />
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="We couldn't find any stays."
              description="Try changing your dates or searching a nearby city."
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="No stays match these filters."
              description="Loosen a filter to see more of the properties we found."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilters(EMPTY_HOTEL_FILTERS)}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="space-y-4">
              {visible.map((hotel, index) => (
                <li key={hotel.id}>
                  <HotelCard
                    hotel={hotel}
                    nights={data.nights}
                    detailsHref={detailsHref(hotel.slug)}
                    priority={index < 2}
                  />
                </li>
              ))}
            </ul>
          )}

          {results.length > 0 ? (
            <p className="mt-6 text-xs leading-relaxed text-ink-subtle">
              Nightly prices are for the dates and party size you searched. Taxes, resort fees and
              cancellation terms are confirmed by the booking provider before you pay.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container-page py-6 lg:py-8">
      <SearchProgress message="Searching stays… comparing available rates." />
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
        <div className="space-y-4">
          {[0, 1, 2, 3].map((index) => (
            <HotelCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
