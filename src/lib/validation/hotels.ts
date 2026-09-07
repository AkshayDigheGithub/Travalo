import { z } from "zod";

import { daysBetween } from "@/lib/utils/date";
import { currencySchema, futureDateSchema, intParam, isoDateSchema } from "./common";

const MAX_NIGHTS = 30;

export const hotelSearchSchema = z
  .object({
    destination: z.string().trim().min(2, { message: "Where are you going?" }).max(80),
    /** Optional Hotellook location id when the user picked a suggestion. */
    locationId: z.string().trim().max(24).optional(),
    checkin: futureDateSchema,
    checkout: isoDateSchema,
    guests: intParam(1, 16, 2),
    rooms: intParam(1, 8, 1),
    currency: currencySchema,
  })
  .superRefine((value, ctx) => {
    const nights = daysBetween(value.checkin, value.checkout);
    if (nights <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkout"],
        message: "Check-out must be after check-in.",
      });
    } else if (nights > MAX_NIGHTS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkout"],
        message: `Stays are limited to ${MAX_NIGHTS} nights.`,
      });
    }

    if (value.rooms > value.guests) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rooms"],
        message: "You can't book more rooms than guests.",
      });
    }
  });

export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;

export const hotelDetailsSchema = z.object({
  id: z.string().trim().min(1).max(64),
  checkin: isoDateSchema.optional(),
  checkout: isoDateSchema.optional(),
  guests: intParam(1, 16, 2),
  currency: currencySchema,
});

export const hotelLocationQuerySchema = z.object({
  q: z.string().trim().min(1).max(60),
});
