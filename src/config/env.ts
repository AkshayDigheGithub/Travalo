import "server-only";

/**
 * Server-only environment access.
 *
 * Nothing in here is ever imported from a client component, so Travelpayouts
 * credentials cannot end up in the browser bundle. Reads are lazy so that a
 * missing variable degrades a single feature instead of failing the build.
 */

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function boolean(name: string, fallback: boolean): boolean {
  const value = optional(name)?.toLowerCase();
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export const serverEnv = {
  get travelpayoutsToken() {
    return optional("TRAVELPAYOUTS_API_TOKEN");
  },
  get travelpayoutsMarker() {
    return optional("TRAVELPAYOUTS_MARKER");
  },
  get travelpayoutsHost() {
    // Host reported to Travelpayouts on link generation; defaults to our own site.
    return optional("TRAVELPAYOUTS_HOST");
  },
  /**
   * Mock mode is the default: the app must run end to end before credentials
   * exist. Production deployments set TRAVELPAYOUTS_MOCK=false explicitly.
   */
  get useMockProvider() {
    const explicit = optional("TRAVELPAYOUTS_MOCK");
    if (explicit !== undefined) return boolean("TRAVELPAYOUTS_MOCK", true);
    return !optional("TRAVELPAYOUTS_API_TOKEN");
  },
  get mockScenario() {
    // "normal" | "empty" | "error" | "slow" — exercises UI states in development.
    return optional("TRAVELPAYOUTS_MOCK_SCENARIO") ?? "normal";
  },
  get databaseUrl() {
    return optional("DATABASE_URL");
  },
  get upstashUrl() {
    return optional("UPSTASH_REDIS_REST_URL");
  },
  get upstashToken() {
    return optional("UPSTASH_REDIS_REST_TOKEN");
  },
  get analyticsEnabled() {
    return boolean("ANALYTICS_ENABLED", true);
  },
} as const;

export const PROVIDER_TIMEOUT_MS = Number(optional("PROVIDER_TIMEOUT_MS") ?? 10_000);
