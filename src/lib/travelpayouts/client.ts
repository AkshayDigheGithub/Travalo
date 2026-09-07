import "server-only";

import { PROVIDER_TIMEOUT_MS, serverEnv } from "@/config/env";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Low-level HTTP client for Travelpayouts hosts.
 *
 * Every call happens on the server. The access token is read from the server
 * environment and appended here, so no route handler or component ever handles
 * the credential itself.
 */

export const TP_HOSTS = {
  /** Flight fare data and reference data (airports, airlines, countries). */
  api: "https://api.travelpayouts.com",
  /** Public place autocomplete; no token required. */
  autocomplete: "https://autocomplete.travelpayouts.com",
  /** Hotellook hotel search and lookup. */
  hotellook: "https://engine.hotellook.com",
} as const;

type RequestOptions = {
  /** Query params; undefined and null values are dropped, arrays repeat the key. */
  params?: Record<string, string | number | boolean | string[] | undefined | null>;
  /** Appends the access token as a `token` query param. */
  withToken?: boolean;
  timeoutMs?: number;
  /** Seconds of Next.js data-cache reuse; fare data is volatile, keep it short. */
  revalidate?: number;
};

export function getAccessToken(): string {
  const token = serverEnv.travelpayoutsToken;
  if (!token) {
    throw new AppError("not_configured", "TRAVELPAYOUTS_API_TOKEN is not set");
  }
  return token;
}

/** Stand-in marker so mock mode runs with zero configuration. */
const DEVELOPMENT_MARKER = "000000";

export function getMarker(): string {
  const marker = serverEnv.travelpayoutsMarker;
  if (marker) return marker;

  // Without a marker a live link would earn nothing and misattribute the click,
  // so only mock mode is allowed to fall back to a placeholder.
  if (serverEnv.useMockProvider) return DEVELOPMENT_MARKER;

  throw new AppError("not_configured", "TRAVELPAYOUTS_MARKER is not set");
}

function buildUrl(base: string, path: string, options: RequestOptions): string {
  const url = new URL(path, base);
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const entry of value) url.searchParams.append(key, entry);
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  if (options.withToken) url.searchParams.set("token", getAccessToken());
  return url.toString();
}

/** Strips the token before a URL is written to a log line. */
function redact(url: string): string {
  return url.replace(/token=[^&]+/g, "token=***");
}

export async function tpFetch<T>(
  base: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(base, path, options);
  const timeoutMs = options.timeoutMs ?? PROVIDER_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      next: options.revalidate ? { revalidate: options.revalidate } : undefined,
      cache: options.revalidate ? undefined : "no-store",
    });

    if (response.status === 429) {
      throw new AppError("rate_limited", `429 from ${redact(url)}`);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AppError("not_configured", `auth rejected by ${redact(url)}`);
    }

    if (!response.ok) {
      throw new AppError("provider_unavailable", `HTTP ${response.status} from ${redact(url)}`);
    }

    const payload = (await response.json()) as T;
    logger.debug("travelpayouts_request", {
      url: redact(url),
      ms: Date.now() - startedAt,
    });
    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      logger.warn("travelpayouts_timeout", { url: redact(url), ms: Date.now() - startedAt });
      throw new AppError("provider_timeout", `timeout after ${timeoutMs}ms`);
    }

    if (error instanceof SyntaxError) {
      throw new AppError("provider_malformed", error.message);
    }

    logger.error("travelpayouts_request_failed", {
      url: redact(url),
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError("provider_unavailable", String(error));
  } finally {
    clearTimeout(timeout);
  }
}
