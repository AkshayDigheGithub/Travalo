"use client";

import { SearchTabs, type SearchTab } from "./search-tabs";
import type { FlightSearchState, HotelSearchState } from "@/lib/utils/search-params";

/**
 * The floating search card. Kept as a thin client boundary so the rest of the
 * homepage stays a server component.
 */
export function HeroSearch({
  defaultTab,
  flightState,
  hotelState,
}: {
  defaultTab?: SearchTab;
  flightState: FlightSearchState;
  hotelState: HotelSearchState;
}) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-surface/95 p-4 shadow-float backdrop-blur-sm sm:p-6">
      <SearchTabs defaultTab={defaultTab} flightState={flightState} hotelState={hotelState} />
    </div>
  );
}
