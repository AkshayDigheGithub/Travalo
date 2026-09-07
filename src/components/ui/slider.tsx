"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils/cn";

/** Range slider used by the price and duration filters. */
export function Slider({
  className,
  ariaLabels,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { ariaLabels?: string[] }) {
  const thumbCount = props.value?.length ?? props.defaultValue?.length ?? 1;

  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-surface-muted">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-brand-600" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={ariaLabels?.[index]}
          className="block size-5 rounded-full border-2 border-brand-600 bg-surface shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        />
      ))}
    </SliderPrimitive.Root>
  );
}
