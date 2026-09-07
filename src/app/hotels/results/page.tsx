import type { Metadata } from "next";

import { NoSearchState } from "@/components/common/states";
import { HotelResults } from "@/features/hotels/hotel-results";
import { SearchSummaryBar } from "@/features/search/search-summary-bar";
import { daysBetween, formatDateRange } from "@/lib/utils/date";
import { hasHotelSearch, hotelSearchQuery, parseHotelState } from "@/lib/utils/search-params";

export const metadata: Metadata = {
  title: "Hotel search results",
  robots: { index: false, follow: true },
};

export default async function HotelResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (!hasHotelSearch(params)) {
    return (
      <div className="container-page py-16">
        <NoSearchState
          title="No search to show"
          description="Start a hotel search and your results will appear here."
          href="/hotels"
          cta="Search hotels"
        />
      </div>
    );
  }

  const state = parseHotelState(params);
  const nights = Math.max(1, daysBetween(state.checkin, state.checkout));

  return (
    <>
      <SearchSummaryBar
        hotelState={state}
        title={state.destination}
        subtitle={`${formatDateRange(state.checkin, state.checkout)} · ${nights} night${
          nights === 1 ? "" : "s"
        } · ${state.guests} guest${state.guests === 1 ? "" : "s"}`}
      />
      {/* Keying on the search resets filters and sorting when the search changes. */}
      <HotelResults key={hotelSearchQuery(state)} state={state} />
    </>
  );
}
