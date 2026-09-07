import "server-only";

import { serverEnv } from "@/config/env";
import { travelpayoutsProvider } from "@/lib/travelpayouts";
import { mockProvider } from "./mock";
import type { TravelProvider } from "./types";

/**
 * Chooses the data source for this deployment.
 *
 * TRAVELPAYOUTS_MOCK=true (the default when no token is configured) serves
 * sample data; production sets it to false and supplies real credentials.
 */
export function getProvider(): TravelProvider {
  return serverEnv.useMockProvider ? mockProvider : travelpayoutsProvider;
}

export type { TravelProvider } from "./types";
