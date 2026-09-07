"use client";

import * as React from "react";

import { TravelImage } from "@/components/common/travel-image";
import { cn } from "@/lib/utils/cn";

/**
 * Gallery with a large primary image and selectable thumbnails. Thumbnails are
 * real buttons so the gallery is fully keyboard operable.
 */
export function HotelGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const gallery = images.length > 0 ? images : [""];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-panel bg-surface-muted sm:aspect-[21/9]">
        <TravelImage
          src={gallery[active] || undefined}
          alt={name}
          priority
          sizes="(max-width: 1024px) 100vw, 80vw"
        />
      </div>

      {gallery.length > 1 ? (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {gallery.map((image, index) => (
            <li key={`${image}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1} of ${gallery.length}`}
                aria-pressed={index === active}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                  index === active
                    ? "border-brand-600"
                    : "border-transparent hover:border-line-strong",
                )}
              >
                <TravelImage src={image || undefined} alt="" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
