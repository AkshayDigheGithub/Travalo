"use client";

import * as React from "react";
import { Users } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Stepper } from "./stepper";

export function guestSummary(guests: number, rooms: number): string {
  return `${guests} ${guests === 1 ? "guest" : "guests"} · ${rooms} ${rooms === 1 ? "room" : "rooms"}`;
}

export function GuestSelector({
  guests,
  rooms,
  onChange,
}: {
  guests: number;
  rooms: number;
  onChange: (next: { guests: number; rooms: number }) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex w-full items-center gap-3 text-left">
          <Users className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
              Guests
            </span>
            <span className="block truncate text-base font-medium text-ink">
              {guestSummary(guests, rooms)}
            </span>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[min(20rem,calc(100vw-2rem))]">
        <Stepper
          id="guests"
          label="Guests"
          value={guests}
          min={1}
          max={16}
          onChange={(next) => onChange({ guests: next, rooms: Math.min(rooms, next) })}
        />
        <Stepper
          id="rooms"
          label="Rooms"
          value={rooms}
          min={1}
          max={8}
          onChange={(next) => onChange({ guests: Math.max(guests, next), rooms: next })}
        />
      </PopoverContent>
    </Popover>
  );
}
