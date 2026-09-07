"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FlightSearchForm } from "@/features/flights/flight-search-form";
import { HotelSearchForm } from "@/features/hotels/hotel-search-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import type { FlightSearchState, HotelSearchState } from "@/lib/utils/search-params";

/**
 * Results-page header: what was searched, and a way to change it.
 *
 * On desktop the form expands inline; on small screens it opens as a
 * near-full-height sheet, which is the only comfortable way to edit a
 * multi-field travel search on a phone.
 */
export function SearchSummaryBar({
  title,
  subtitle,
  flightState,
  hotelState,
}: {
  title: React.ReactNode;
  subtitle: string;
  flightState?: FlightSearchState;
  hotelState?: HotelSearchState;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const form = flightState ? (
    <FlightSearchForm initialState={flightState} compact onSubmitted={() => setExpanded(false)} />
  ) : hotelState ? (
    <HotelSearchForm initialState={hotelState} compact onSubmitted={() => setExpanded(false)} />
  ) : null;

  return (
    <section className="border-b border-line bg-surface">
      <div className="container-page py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
          </div>

          {isDesktop ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              aria-controls="edit-search-panel"
            >
              <Pencil className="size-4" aria-hidden="true" />
              {expanded ? "Close" : "Edit search"}
            </Button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit search
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" title="Edit search" className="h-[92vh]">
                <div className="p-4">{form}</div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {isDesktop ? (
          <div
            id="edit-search-panel"
            className={cn("overflow-hidden transition-all", expanded ? "mt-5" : "hidden")}
          >
            {form}
          </div>
        ) : null}
      </div>
    </section>
  );
}
