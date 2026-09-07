import { z } from "zod";

import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/config/currencies";
import { isIsoDate, isPastDate } from "@/lib/utils/date";

export const currencySchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(SUPPORTED_CURRENCIES))
  .catch(DEFAULT_CURRENCY);

export const isoDateSchema = z
  .string()
  .refine(isIsoDate, { message: "Use a valid date in YYYY-MM-DD format." });

export const futureDateSchema = isoDateSchema.refine((value) => !isPastDate(value), {
  message: "Choose a date that is today or later.",
});

export const iataCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .length(3, { message: "Airport codes are three letters." })
      .regex(/^[A-Z]{3}$/, { message: "Airport codes are three letters." }),
  );

/** Coerces `?adults=2` style params, tolerating absent values. */
export function intParam(min: number, max: number, fallback: number) {
  return z.coerce.number().int().min(min).max(max).catch(fallback);
}

export type ValidationIssue = { field: string; message: string };

export function toIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message,
  }));
}
