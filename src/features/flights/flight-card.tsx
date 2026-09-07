"use client";

import Image from "next/image";
import * as React from "react";
import { ArrowRight, Briefcase, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/common/price-display";
import { cityNameForCode } from "@/config/airports";
import { CABIN_LABELS } from "@/lib/validation/flights";
import { dayOffset, formatDuration, formatTimeOfDay } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { FlightLeg, FlightResult } from "@/types/flight";
import { stopsLabel } from "./filtering";

export function FlightCard({
  result,
  travellers,
  className,
}: {
  result: FlightResult;
  travellers: number;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group rounded-card border border-line bg-surface p-4 transition-all duration-200 hover:border-line-strong hover:shadow-lift sm:p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <AirlineLogo airline={result.airline} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{result.airline.name}</p>
              <p className="truncate text-xs text-ink-subtle">
                {result.flightNumber ? `${result.flightNumber} · ` : ""}
                {CABIN_LABELS[result.cabin]}
              </p>
            </div>
          </div>

          <Leg leg={result.outbound} />
          {result.inbound ? <Leg leg={result.inbound} isReturn /> : null}

          <div className="flex flex-wrap items-center gap-2">
            {result.baggageIncluded === true ? (
              <Badge variant="positive">
                <Briefcase className="size-3" aria-hidden="true" />
                Cabin + checked bag
              </Badge>
            ) : null}
            {result.stops === 0 ? <Badge variant="brand">Non-stop</Badge> : null}
            {result.isMock ? <Badge variant="accent">Sample data</Badge> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-end justify-between gap-4 border-t border-line pt-4 sm:w-44 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <PriceDisplay
            amount={result.price}
            currency={result.currency}
            source={result.priceSource}
            size="lg"
            caption={travellers > 1 ? "per traveller" : undefined}
          />
          <Button asChild className="shrink-0">
            {/* rel="sponsored nofollow" marks the affiliate link; /go records the
                click and only then redirects to the validated partner URL. */}
            <a
              href={result.bookingUrl}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
            >
              View Deal
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

function AirlineLogo({ airline }: { airline: FlightResult["airline"] }) {
  const [failed, setFailed] = React.useState(false);

  if (!airline.logoUrl || failed) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-ink-muted">
        {airline.code}
      </span>
    );
  }

  return (
    <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
      <Image
        src={airline.logoUrl}
        alt=""
        fill
        sizes="40px"
        className="object-contain p-1"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function Leg({ leg, isReturn = false }: { leg: FlightLeg; isReturn?: boolean }) {
  const overnight = dayOffset(leg.departureAt, leg.arrivalAt);

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <span
        className="w-14 shrink-0 text-[11px] font-medium tracking-wide text-ink-subtle uppercase"
        aria-hidden="true"
      >
        {isReturn ? "Return" : "Outbound"}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <Endpoint time={formatTimeOfDay(leg.departureAt)} code={leg.origin} />

        <div className="min-w-0 flex-1 pb-1 text-center">
          <p className="text-[11px] font-medium text-ink-muted">
            {formatDuration(leg.durationMinutes)}
          </p>
          <div className="relative my-1 h-px w-full bg-line-strong">
            <ArrowRight
              className="absolute -top-1.5 -right-1 size-3 text-line-strong"
              aria-hidden="true"
            />
            {leg.stops > 0 ? (
              <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500" />
            ) : null}
          </div>
          <p className="text-[11px] text-ink-subtle">{stopsLabel(leg.stops)}</p>
        </div>

        <Endpoint
          time={formatTimeOfDay(leg.arrivalAt)}
          code={leg.destination}
          dayOffset={overnight}
          align="right"
        />
      </div>
    </div>
  );
}

function Endpoint({
  time,
  code,
  dayOffset: offset = 0,
  align = "left",
}: {
  time: string;
  code: string;
  dayOffset?: number;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("shrink-0", align === "right" && "text-right")}>
      <p className="text-lg leading-tight font-semibold text-ink tabular-nums">
        {time}
        {offset > 0 ? (
          <sup className="ml-0.5 text-[10px] font-medium text-accent-600">+{offset}</sup>
        ) : null}
      </p>
      <p className="text-xs text-ink-muted">
        <abbr title={cityNameForCode(code)} className="no-underline">
          {code}
        </abbr>
      </p>
    </div>
  );
}
