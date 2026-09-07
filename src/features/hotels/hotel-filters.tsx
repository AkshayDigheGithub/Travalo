"use client";

import { CheckRow, FilterGroup, FilterPanelShell } from "@/components/common/filter-shell";
import { Slider } from "@/components/ui/slider";
import { formatMoney } from "@/lib/currency";
import type { CurrencyCode } from "@/config/currencies";
import type { HotelPropertyType } from "@/types/hotel";
import {
  EMPTY_HOTEL_FILTERS,
  PROPERTY_TYPE_LABELS,
  countActiveHotelFilters,
  type HotelFacets,
  type HotelFilters,
} from "./filtering";

const RATING_THRESHOLDS = [
  { value: 9, label: "Exceptional 9+" },
  { value: 8, label: "Very good 8+" },
  { value: 7, label: "Good 7+" },
];

export function HotelFilterPanel({
  filters,
  facets,
  currency,
  onChange,
  onFilterUsed,
}: {
  filters: HotelFilters;
  facets: HotelFacets;
  currency: CurrencyCode;
  onChange: (next: HotelFilters) => void;
  onFilterUsed?: (facet: string) => void;
}) {
  function patch(next: Partial<HotelFilters>, facet: string) {
    onChange({ ...filters, ...next });
    onFilterUsed?.(facet);
  }

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
  }

  return (
    <FilterPanelShell
      activeCount={countActiveHotelFilters(filters)}
      onReset={() => onChange(EMPTY_HOTEL_FILTERS)}
    >
      {facets.priceRange && facets.priceRange.max > facets.priceRange.min ? (
        <FilterGroup title="Price" description="Maximum per night">
          <Slider
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            step={Math.max(1, Math.round((facets.priceRange.max - facets.priceRange.min) / 60))}
            value={[filters.maxPricePerNight ?? facets.priceRange.max]}
            ariaLabels={["Maximum nightly price"]}
            onValueChange={([value]) => onChange({ ...filters, maxPricePerNight: value })}
            onValueCommit={() => onFilterUsed?.("price")}
          />
          <p className="mt-3 flex justify-between text-xs text-ink-muted tabular-nums">
            <span>{formatMoney(facets.priceRange.min, currency)}</span>
            <span className="font-medium text-ink">
              Up to {formatMoney(filters.maxPricePerNight ?? facets.priceRange.max, currency)}
            </span>
          </p>
        </FilterGroup>
      ) : null}

      {facets.hasStars ? (
        <FilterGroup title="Star rating">
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2].map((stars) => {
              const active = filters.stars.includes(stars);
              return (
                <button
                  key={stars}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patch({ stars: toggle(filters.stars, stars) }, "stars")}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {stars} star{stars > 1 ? "s" : ""}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      {facets.hasRatings ? (
        <FilterGroup title="Guest rating">
          <div className="flex flex-wrap gap-2">
            {RATING_THRESHOLDS.map((threshold) => {
              const active = filters.minRating === threshold.value;
              return (
                <button
                  key={threshold.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    patch({ minRating: active ? null : threshold.value }, "guest_rating")
                  }
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {threshold.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      {facets.propertyTypes.length > 1 ? (
        <FilterGroup title="Property type">
          {facets.propertyTypes.map((type) => (
            <CheckRow
              key={type}
              id={`property-${type}`}
              label={PROPERTY_TYPE_LABELS[type]}
              checked={filters.propertyTypes.includes(type)}
              onChange={() =>
                patch(
                  { propertyTypes: toggle<HotelPropertyType>(filters.propertyTypes, type) },
                  "property_type",
                )
              }
            />
          ))}
        </FilterGroup>
      ) : null}

      {facets.hasBreakfastData || facets.hasCancellationData ? (
        <FilterGroup title="Booking options">
          {facets.hasBreakfastData ? (
            <CheckRow
              id="breakfast"
              label="Breakfast included"
              checked={filters.breakfastOnly}
              onChange={(checked) => patch({ breakfastOnly: checked }, "breakfast")}
            />
          ) : null}
          {facets.hasCancellationData ? (
            <CheckRow
              id="free-cancellation"
              label="Free cancellation"
              checked={filters.freeCancellationOnly}
              onChange={(checked) => patch({ freeCancellationOnly: checked }, "free_cancellation")}
            />
          ) : null}
        </FilterGroup>
      ) : null}

      {facets.amenities.length > 0 ? (
        <FilterGroup title="Amenities">
          <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
            {facets.amenities.map((amenity) => (
              <CheckRow
                key={amenity}
                id={`amenity-${amenity}`}
                label={amenity}
                checked={filters.amenities.includes(amenity)}
                onChange={() => patch({ amenities: toggle(filters.amenities, amenity) }, "amenity")}
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}
    </FilterPanelShell>
  );
}
