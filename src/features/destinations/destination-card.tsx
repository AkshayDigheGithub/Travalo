import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { TravelImage } from "@/components/common/travel-image";
import { cn } from "@/lib/utils/cn";
import type { Destination } from "@/config/destinations";

export function DestinationCard({
  destination,
  className,
  priority = false,
}: {
  destination: Destination;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-card bg-ink shadow-card transition-shadow duration-300 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
        <TravelImage
          src={destination.heroImage}
          alt={destination.name}
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{destination.name}</h3>
          <p className="truncate text-xs text-white/75">{destination.country}</p>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-ink">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
