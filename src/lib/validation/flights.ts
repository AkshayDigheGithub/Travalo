import { z } from "zod";

import { daysBetween } from "@/lib/utils/date";
import {
  currencySchema,
  futureDateSchema,
  iataCodeSchema,
  intParam,
  isoDateSchema,
} from "./common";

export const TRIP_TYPES = ["round-trip", "one-way", "multi-city"] as const;
export const CABIN_CLASSES = ["economy", "premium_economy", "business", "first"] as const;

export const CABIN_LABELS: Record<(typeof CABIN_CLASSES)[number], string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

/** Longest trip window we accept; guards against absurd or accidental ranges. */
const MAX_TRIP_NIGHTS = 330;

export const flightSearchSchema = z
  .object({
    tripType: z.enum(TRIP_TYPES).catch("round-trip"),
    from: iataCodeSchema,
    to: iataCodeSchema,
    departure: futureDateSchema,
    return: isoDateSchema.optional(),
    adults: intParam(1, 9, 1),
    children: intParam(0, 8, 0),
    infants: intParam(0, 9, 0),
    cabin: z.enum(CABIN_CLASSES).catch("economy"),
    currency: currencySchema,
    directOnly: z
      .union([z.boolean(), z.string()])
      .transform((value) => value === true || value === "true" || value === "1")
      .catch(false),
  })
  .superRefine((value, ctx) => {
    if (value.from === value.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "Origin and destination must be different.",
      });
    }

    if (value.tripType === "round-trip" && !value.return) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["return"],
        message: "Choose a return date, or switch to one way.",
      });
    }

    if (value.return) {
      if (value.return < value.departure) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["return"],
          message: "Return must be on or after departure.",
        });
      } else if (daysBetween(value.departure, value.return) > MAX_TRIP_NIGHTS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["return"],
          message: "That trip is longer than we can search for.",
        });
      }
    }

    if (value.infants > value.adults) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["infants"],
        message: "Each infant needs an accompanying adult.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    // A one-way search never carries a return date, whatever the URL says.
    return: value.tripType === "one-way" ? undefined : value.return,
  }));

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;

export const airportQuerySchema = z.object({
  q: z.string().trim().min(1).max(60),
  locale: z.string().trim().length(2).catch("en"),
});
