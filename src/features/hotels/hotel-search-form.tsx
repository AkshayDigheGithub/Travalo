"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/features/search/date-range-picker";
import { GuestSelector } from "@/features/search/guest-selector";
import { PlaceAutocomplete } from "@/features/search/place-autocomplete";
import { useCurrency } from "@/hooks/use-currency";
import { track } from "@/lib/analytics/client";
import { addDays, isPastDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { hotelResultsHref, type HotelSearchState } from "@/lib/utils/search-params";

type Errors = Partial<Record<"destination" | "checkin" | "checkout", string>>;

export function HotelSearchForm({
  initialState,
  onSubmitted,
  compact = false,
}: {
  initialState: HotelSearchState;
  onSubmitted?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { currency } = useCurrency();
  const [state, setState] = React.useState<HotelSearchState>(initialState);
  const [destinationText, setDestinationText] = React.useState(initialState.destination);
  const [errors, setErrors] = React.useState<Errors>({});

  function update(patch: Partial<HotelSearchState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // A typed destination is valid even without picking a suggestion.
    const destination = (destinationText || state.destination).trim();
    const next = { ...state, destination, currency };

    const found: Errors = {};
    if (destination.length < 2) found.destination = "Where are you going?";
    if (isPastDate(next.checkin)) found.checkin = "Check-in can't be in the past.";
    if (next.checkout <= next.checkin) found.checkout = "Check-out must be after check-in.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    track("hotel_search", { destination, guests: next.guests, rooms: next.rooms });
    onSubmitted?.();
    router.push(hotelResultsHref(next));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div
        className={cn(
          "grid gap-px rounded-panel bg-line",
          compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1.6fr_1.4fr_1fr_auto]",
        )}
      >
        <div
          className={cn("bg-surface px-4 py-3", compact ? "rounded-t-panel" : "lg:rounded-l-panel")}
        >
          <PlaceAutocomplete
            id="hotel-destination"
            label="Destination"
            placeholder="City, region or hotel"
            endpoint="/api/hotels/locations"
            icon="pin"
            value={state.destination}
            displayValue={destinationText}
            onDisplayValueChange={(value) => {
              setDestinationText(value);
              update({ destination: value });
            }}
            onSelect={(place) => {
              update({ destination: place.cityName });
              setErrors((current) => ({ ...current, destination: undefined }));
            }}
            error={errors.destination}
          />
        </div>

        <div className="bg-surface px-4 py-3">
          <DateRangePicker
            id="hotel-dates"
            mode="range"
            startLabel="Check-in"
            endLabel="Check-out"
            start={state.checkin}
            end={state.checkout}
            error={errors.checkin ?? errors.checkout}
            onChange={({ start, end }) =>
              update({ checkin: start, checkout: end ?? addDays(start, 1) })
            }
          />
        </div>

        <div className="bg-surface px-4 py-3">
          <GuestSelector
            guests={state.guests}
            rooms={state.rooms}
            onChange={(next) => update(next)}
          />
        </div>

        <div
          className={cn(
            "flex items-center bg-surface p-2",
            compact ? "rounded-b-panel" : "lg:rounded-r-panel",
          )}
        >
          <Button type="submit" size="lg" className="w-full lg:w-auto lg:px-6">
            <Search className="size-5" aria-hidden="true" />
            <span className={compact ? "" : "lg:sr-only xl:not-sr-only"}>Search hotels</span>
          </Button>
        </div>
      </div>

      {(errors.checkin || errors.checkout) && (
        <p className="text-sm text-danger" role="alert">
          {errors.checkin ?? errors.checkout}
        </p>
      )}
    </form>
  );
}
