/**
 * Timezone-safe date helpers.
 *
 * Travel dates are calendar dates, not instants: 2026-10-18 means the 18th
 * wherever the traveller is. Everything here works on `YYYY-MM-DD` strings and
 * only ever constructs Date objects at UTC midnight, so a browser in UTC-07:00
 * can never shift a date by a day.
 */

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const date = parseIsoDate(value);
  return !Number.isNaN(date.getTime()) && toIsoDate(date) === value;
}

/** Parses `YYYY-MM-DD` into a Date pinned to UTC midnight. */
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

/** Formats a Date to `YYYY-MM-DD` using its UTC fields. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today in the viewer's local calendar, expressed as an ISO date string. */
export function todayIso(): string {
  const now = new Date();
  return toIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(value: string, days: number): string {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function daysBetween(from: string, to: string): number {
  const ms = parseIsoDate(to).getTime() - parseIsoDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function isPastDate(value: string, reference = todayIso()): boolean {
  return value < reference;
}

export function isBefore(a: string, b: string): boolean {
  return a < b;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "18 Oct" — the compact form used in search summaries and cards. */
export function formatShortDate(value: string): string {
  const date = parseIsoDate(value);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** "Sat, 18 Oct 2026" — used where the day of week matters. */
export function formatLongDate(value: string): string {
  const date = parseIsoDate(value);
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDateRange(from: string, to?: string): string {
  if (!to) return formatShortDate(from);
  return `${formatShortDate(from)} – ${formatShortDate(to)}`;
}

/**
 * Extracts `HH:MM` from a local ISO datetime without going through Date, so a
 * time reported by the provider is displayed exactly as reported.
 */
export function formatTimeOfDay(isoDateTime: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(isoDateTime);
  return match ? `${match[1]}:${match[2]}` : "--:--";
}

export function hourOfDay(isoDateTime: string): number {
  const match = /T(\d{2}):/.exec(isoDateTime);
  return match ? Number(match[1]) : 0;
}

/** Adds minutes to a local ISO datetime, preserving the "no timezone" contract. */
export function addMinutesToLocalIso(isoDateTime: string, minutes: number): string {
  const base = new Date(`${stripZone(isoDateTime)}Z`);
  base.setUTCMinutes(base.getUTCMinutes() + minutes);
  return base.toISOString().slice(0, 19);
}

/** Number of calendar days a leg crosses, e.g. an overnight flight returns 1. */
export function dayOffset(fromIso: string, toIso: string): number {
  return daysBetween(fromIso.slice(0, 10), toIso.slice(0, 10));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function stripZone(value: string): string {
  return value.replace(/(Z|[+-]\d{2}:?\d{2})$/, "");
}

/**
 * Bridges to calendar widgets, which work in local Date objects.
 * These use local Y/M/D fields deliberately so no timezone shift can occur.
 */
export function isoToLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function localDateToIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
