import type { Metadata } from "next";

import { NoSearchState } from "@/components/common/states";
import { FlightResults } from "@/features/flights/flight-results";
import { SearchSummaryBar } from "@/features/search/search-summary-bar";
import { cityNameForCode } from "@/config/airports";
import { CABIN_LABELS } from "@/lib/validation/flights";
import { formatDateRange } from "@/lib/utils/date";
import { flightSearchQuery, hasFlightSearch, parseFlightState } from "@/lib/utils/search-params";

/**
 * Search-result pages are per-user and change constantly, so they are excluded
 * from indexing while still passing link equity onward (`noindex, follow`).
 */
export const metadata: Metadata = {
  title: "Flight search results",
  robots: { index: false, follow: true },
};

export default async function FlightResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (!hasFlightSearch(params)) {
    return (
      <div className="container-page py-16">
        <NoSearchState
          title="No search to show"
          description="Start a flight search and your results will appear here."
          href="/flights"
          cta="Search flights"
        />
      </div>
    );
  }

  const state = parseFlightState(params);
  const travellers = state.adults + state.children + state.infants;

  return (
    <>
      <SearchSummaryBar
        flightState={state}
        title={
          <>
            {cityNameForCode(state.from)}{" "}
            <span className="text-ink-subtle" aria-hidden="true">
              →
            </span>{" "}
            <span className="sr-only">to</span>
            {cityNameForCode(state.to)}
          </>
        }
        subtitle={`${formatDateRange(state.departure, state.return)} · ${travellers} ${
          travellers === 1 ? "traveller" : "travellers"
        } · ${CABIN_LABELS[state.cabin]}`}
      />
      {/* Keying on the search resets filters and sorting when the search changes. */}
      <FlightResults key={flightSearchQuery(state)} state={state} />
    </>
  );
}
