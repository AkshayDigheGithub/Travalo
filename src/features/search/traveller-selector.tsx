"use client";

import * as React from "react";
import { Users } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CABIN_CLASSES, CABIN_LABELS } from "@/lib/validation/flights";
import type { CabinClass } from "@/types/search";
import { Stepper } from "./stepper";

export type Travellers = { adults: number; children: number; infants: number };

export function travellerSummary({ adults, children, infants }: Travellers): string {
  const total = adults + children + infants;
  return `${total} ${total === 1 ? "traveller" : "travellers"}`;
}

export function TravellerSelector({
  travellers,
  cabin,
  onTravellersChange,
  onCabinChange,
}: {
  travellers: Travellers;
  cabin: CabinClass;
  onTravellersChange: (next: Travellers) => void;
  onCabinChange: (next: CabinClass) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex w-full items-center gap-3 text-left">
          <Users className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
              Travellers
            </span>
            <span className="block truncate text-base font-medium text-ink">
              {travellerSummary(travellers)} · {CABIN_LABELS[cabin]}
            </span>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))]">
        <Stepper
          id="adults"
          label="Adults"
          hint="12 years and over"
          value={travellers.adults}
          min={1}
          max={9}
          onChange={(adults) =>
            onTravellersChange({
              ...travellers,
              adults,
              // Each infant travels with an adult, so keep the pair valid.
              infants: Math.min(travellers.infants, adults),
            })
          }
        />
        <Stepper
          id="children"
          label="Children"
          hint="2–11 years"
          value={travellers.children}
          min={0}
          max={8}
          onChange={(children) => onTravellersChange({ ...travellers, children })}
        />
        <Stepper
          id="infants"
          label="Infants"
          hint="Under 2, on lap"
          value={travellers.infants}
          min={0}
          max={travellers.adults}
          onChange={(infants) => onTravellersChange({ ...travellers, infants })}
        />

        <div className="mt-3 border-t border-line pt-4">
          <label htmlFor="cabin" className="mb-1.5 block text-sm font-medium text-ink">
            Cabin
          </label>
          <Select value={cabin} onValueChange={(value) => onCabinChange(value as CabinClass)}>
            <SelectTrigger id="cabin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CABIN_CLASSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {CABIN_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
