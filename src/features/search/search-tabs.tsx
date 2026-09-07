"use client";

import * as React from "react";
import { BedDouble, Plane } from "lucide-react";

import { FlightSearchForm } from "@/features/flights/flight-search-form";
import { HotelSearchForm } from "@/features/hotels/hotel-search-form";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils/cn";
import {
  defaultFlightState,
  defaultHotelState,
  type FlightSearchState,
  type HotelSearchState,
} from "@/lib/utils/search-params";

export type SearchTab = "flights" | "hotels";

/**
 * The product's front door. Both forms stay mounted so switching tabs doesn't
 * discard what the user already typed.
 */
export function SearchTabs({
  defaultTab = "flights",
  flightState,
  hotelState,
  compact = false,
  onSubmitted,
}: {
  defaultTab?: SearchTab;
  flightState?: FlightSearchState;
  hotelState?: HotelSearchState;
  compact?: boolean;
  onSubmitted?: () => void;
}) {
  const { currency } = useCurrency();
  const [tab, setTab] = React.useState<SearchTab>(defaultTab);

  const tabs: { id: SearchTab; label: string; icon: typeof Plane }[] = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "hotels", label: "Hotels", icon: BedDouble },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Search type" className="mb-4 flex gap-1.5">
        {tabs.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              id={`search-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`search-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface text-ink-muted hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="search-panel-flights"
        aria-labelledby="search-tab-flights"
        hidden={tab !== "flights"}
      >
        <FlightSearchForm
          initialState={flightState ?? defaultFlightState(currency)}
          compact={compact}
          onSubmitted={onSubmitted}
        />
      </div>

      <div
        role="tabpanel"
        id="search-panel-hotels"
        aria-labelledby="search-tab-hotels"
        hidden={tab !== "hotels"}
      >
        <HotelSearchForm
          initialState={hotelState ?? defaultHotelState(currency)}
          compact={compact}
          onSubmitted={onSubmitted}
        />
      </div>
    </div>
  );
}
