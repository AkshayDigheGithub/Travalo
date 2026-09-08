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
   * Project id ("trs") subscribed to the brand program. Travelpayouts only
   * registers a click when the visitor passes through their redirector, and the
   * redirector requires this alongside the marker — without it we can still send
   * the traveller to the partner, but the click never reaches the dashboard.
   */
  get travelpayoutsTrs() {
    return optional("TRAVELPAYOUTS_TRS");
  },
  /** Program ids taken from a link generated in the Travelpayouts dashboard. */
  get travelpayoutsFlightsProgram() {
    return {
      p: optional("TRAVELPAYOUTS_FLIGHTS_P") ?? "4114",
      campaignId: optional("TRAVELPAYOUTS_FLIGHTS_CAMPAIGN_ID") ?? "100",
    };
  },
  /**
   * No default: the Hotellook program closed in October 2025, so the ids depend
   * on whichever accommodation program the account has joined since.
   */
  get travelpayoutsHotelsProgram() {
    const p = optional("TRAVELPAYOUTS_HOTELS_P");
    const campaignId = optional("TRAVELPAYOUTS_HOTELS_CAMPAIGN_ID");
    return p && campaignId ? { p, campaignId } : undefined;
  },
  /** Escape hatch: send travellers straight to the partner, unwrapped. */
  get travelpayoutsClickTracking() {
    return boolean("TRAVELPAYOUTS_CLICK_TRACKING", true);
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
