"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";

/**
 * Image with a designed fallback.
 *
 * Remote travel imagery can 404 or be blocked; rather than showing a broken
 * frame we fall back to a deterministic gradient derived from the caption, so
 * a card always looks finished.
 */
export function TravelImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  fill = true,
  width,
  height,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = React.useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className={cn("grid h-full w-full place-items-center", className)}
        style={{ background: gradientFor(alt) }}
        role="img"
        aria-label={alt}
      >
        <span className="px-3 text-center text-xs font-medium tracking-wide text-white/85 uppercase">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}

/** Stable hue per caption so the same place always gets the same colour. */
function gradientFor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 360;
  }
  return `linear-gradient(135deg, oklch(0.62 0.11 ${hash}) 0%, oklch(0.42 0.09 ${(hash + 48) % 360}) 100%)`;
}
