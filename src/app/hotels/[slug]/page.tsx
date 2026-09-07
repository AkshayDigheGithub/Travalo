import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Info, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockDataNotice } from "@/components/common/mock-notice";
import { PriceDisplay } from "@/components/common/price-display";
import { GuestScore, StarRating } from "@/components/common/rating";
import { HotelGallery } from "@/features/hotels/hotel-gallery";
import { PROPERTY_TYPE_LABELS } from "@/features/hotels/filtering";
import { siteConfig } from "@/config/site";
import { newSearchId } from "@/lib/analytics/server";
import { getProvider } from "@/lib/providers";
import { toAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { daysBetween, formatDateRange } from "@/lib/utils/date";
import { hotelDetailsSchema } from "@/lib/validation/hotels";
import type { HotelDetails } from "@/types/hotel";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Detail pages are rendered on demand from live provider data, so they are not
 * indexed — the indexable, stable pages are the destination guides.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const readableName = slug
    .replace(/-\d+$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: readableName,
    description: `Rooms, amenities and prices for ${readableName} on ${siteConfig.name}.`,
    robots: { index: false, follow: true },
  };
}

async function loadHotel(
  slug: string,
  params: Record<string, string | string[] | undefined>,
): Promise<HotelDetails | null> {
  const flat = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  const parsed = hotelDetailsSchema.safeParse({ ...flat, id: slug });
  if (!parsed.success) return null;

  try {
    return await getProvider().getHotelDetails(parsed.data, { searchId: newSearchId() });
  } catch (error) {
    // A provider failure here is a 404-shaped experience, not a crash.
    logger.error("hotel_details_failed", { slug, code: toAppError(error).code });
    return null;
  }
}

export default async function HotelDetailsPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const hotel = await loadHotel(slug, query);

  if (!hotel) notFound();

  const checkin = typeof query.checkin === "string" ? query.checkin : undefined;
  const checkout = typeof query.checkout === "string" ? query.checkout : undefined;
  const nights = checkin && checkout ? Math.max(1, daysBetween(checkin, checkout)) : null;

  return (
    <article className="container-page py-6 lg:py-10">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/hotels" className="transition-colors hover:text-brand-700">
              Hotels
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{hotel.name}</li>
        </ol>
      </nav>

      {hotel.isMock ? <MockDataNotice className="mb-5" /> : null}

      <HotelGallery images={hotel.images ?? (hotel.image ? [hotel.image] : [])} name={hotel.name} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
        <div className="min-w-0 space-y-10">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {hotel.stars ? <StarRating stars={hotel.stars} /> : null}
              <Badge variant="outline">{PROPERTY_TYPE_LABELS[hotel.propertyType]}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {hotel.name}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-ink-muted">
              <MapPin className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              {[hotel.location.address, hotel.location.city, hotel.location.country]
                .filter(Boolean)
                .join(", ")}
            </p>
            {hotel.rating ? (
              <GuestScore score={hotel.rating} reviewCount={hotel.reviewCount} />
            ) : null}
          </header>

          {hotel.description ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">About this property</h2>
              <p className="mt-3 leading-relaxed text-ink-muted">{hotel.description}</p>
            </section>
          ) : null}

          {hotel.amenities.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Amenities</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {hotel.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-ink-muted">
                    <CheckCircle2 className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="text-xl font-semibold text-ink">Room options</h2>
            {hotel.rooms.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {hotel.rooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{room.name}</p>
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {room.boardType}
                        {room.freeCancellation ? " · Free cancellation" : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <PriceDisplay
                        amount={room.price.perNight}
                        currency={room.price.currency}
                        source={room.price.priceSource}
                        caption="per night"
                      />
                      <Button asChild size="sm">
                        <a
                          href={room.bookingUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                        >
                          Book with partner
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-card border border-line bg-surface p-4 text-sm text-ink-muted">
                Room types, live availability and rates for this property are shown by the booking
                provider. Continue to the provider to pick a room.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">Good to know</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {hotel.checkInTime ? (
                <div className="rounded-card border border-line bg-surface p-4">
                  <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                    Check-in
                  </dt>
                  <dd className="mt-1 text-sm text-ink">From {hotel.checkInTime}</dd>
                </div>
              ) : null}
              {hotel.checkOutTime ? (
                <div className="rounded-card border border-line bg-surface p-4">
                  <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                    Check-out
                  </dt>
                  <dd className="mt-1 text-sm text-ink">Until {hotel.checkOutTime}</dd>
                </div>
              ) : null}
              <div className="rounded-card border border-line bg-surface p-4">
                <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                  Cancellation
                </dt>
                <dd className="mt-1 text-sm text-ink">
                  {hotel.freeCancellation
                    ? "Free cancellation available on selected rates."
                    : "Cancellation terms are set by the provider and shown before you pay."}
                </dd>
              </div>
            </dl>

            <ul className="mt-4 space-y-2">
              {hotel.importantInformation.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
                  <Info className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-surface p-5 shadow-card">
            {checkin && checkout ? (
              <p className="text-sm text-ink-muted">
                {formatDateRange(checkin, checkout)}
                {nights ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}
              </p>
            ) : (
              <p className="text-sm text-ink-muted">Prices for your dates</p>
            )}

            {hotel.price ? (
              <div className="mt-3">
                <PriceDisplay
                  amount={hotel.price.perNight}
                  currency={hotel.price.currency}
                  source={hotel.price.priceSource}
                  size="lg"
                  caption="per night"
                  className="text-left"
                />
                {hotel.price.total ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    {nights ? `${nights} night total` : "Stay total"} from{" "}
                    <span className="font-medium text-ink">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: hotel.price.currency,
                        maximumFractionDigits: 0,
                      }).format(hotel.price.total)}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">
                Live rates are shown by the booking provider.
              </p>
            )}

            <Button asChild size="lg" className="mt-5 w-full">
              <a
                href={hotel.bookingUrl}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
              >
                View Deal
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>

            <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
              You&apos;ll complete this booking on the provider&apos;s site. {siteConfig.name}{" "}
              doesn&apos;t take payment or issue confirmations.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
