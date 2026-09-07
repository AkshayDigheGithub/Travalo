import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/common/price-display";
import { GuestScore, StarRating } from "@/components/common/rating";
import { TravelImage } from "@/components/common/travel-image";
import { cn } from "@/lib/utils/cn";
import type { HotelResult } from "@/types/hotel";
import { PROPERTY_TYPE_LABELS } from "./filtering";

export function HotelCard({
  hotel,
  nights,
  detailsHref,
  className,
  priority = false,
}: {
  hotel: HotelResult;
  nights: number;
  detailsHref: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-card border border-line bg-surface transition-all duration-200 hover:border-line-strong hover:shadow-lift",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={detailsHref}
          className="relative block h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-64"
          tabIndex={-1}
          aria-hidden="true"
        >
          <TravelImage
            src={hotel.image}
            alt={hotel.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, 256px"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:gap-6 sm:p-5">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div>
              <h3 className="text-base font-semibold text-ink">
                <Link href={detailsHref} className="transition-colors hover:text-brand-700">
                  {hotel.name}
                </Link>
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {hotel.stars ? <StarRating stars={hotel.stars} /> : null}
                <span className="text-xs text-ink-subtle">
                  {PROPERTY_TYPE_LABELS[hotel.propertyType]}
                </span>
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-sm text-ink-muted">
              <MapPin className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
              <span className="truncate">
                {hotel.location.address ? `${hotel.location.address}, ` : ""}
                {hotel.location.city}
                {hotel.location.distanceToCenterKm
                  ? ` · ${hotel.location.distanceToCenterKm} km from centre`
                  : ""}
              </span>
            </p>

            {hotel.rating ? (
              <GuestScore score={hotel.rating} reviewCount={hotel.reviewCount} />
            ) : null}

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {hotel.breakfastIncluded ? (
                <Badge variant="positive">Breakfast included</Badge>
              ) : null}
              {hotel.freeCancellation ? <Badge variant="brand">Free cancellation</Badge> : null}
              {hotel.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="outline">
                  {amenity}
                </Badge>
              ))}
              {hotel.isMock ? <Badge variant="accent">Sample data</Badge> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-end justify-between gap-3 border-t border-line pt-3 sm:w-44 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
            {hotel.price ? (
              <div>
                <PriceDisplay
                  amount={hotel.price.perNight}
                  currency={hotel.price.currency}
                  source={hotel.price.priceSource}
                  caption="per night"
                />
                {hotel.price.total ? (
                  <p className="mt-1 text-right text-xs text-ink-subtle">
                    {nights} night{nights === 1 ? "" : "s"} total
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-ink-subtle">Price on partner site</p>
            )}

            <div className="flex flex-col items-end gap-2">
              <Button asChild size="sm">
                <a
                  href={hotel.bookingUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                >
                  View Deal
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Link
                href={detailsHref}
                className="text-xs font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                See details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
