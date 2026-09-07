import "server-only";

import { Pool, type QueryResultRow } from "pg";

import { serverEnv } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Optional Postgres (Supabase-friendly). Search works without a database;
 * the database only adds destination content, analytics and click tracking.
 */

let pool: Pool | null | undefined;

function getPool(): Pool | null {
  if (pool !== undefined) return pool;

  const connectionString = serverEnv.databaseUrl;
  if (!connectionString) {
    pool = null;
    return pool;
  }

  pool = new Pool({
    connectionString,
    // Serverless functions are short-lived: a small pool avoids exhausting
    // Supabase connection limits across many concurrent lambdas.
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  pool.on("error", (error) => logger.error("db_pool_error", { error: error.message }));
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(serverEnv.databaseUrl);
}

/**
 * Runs a query, returning null instead of throwing when the database is
 * absent or unhealthy — analytics must never break a user-facing request.
 */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[] | null> {
  const client = getPool();
  if (!client) return null;

  try {
    const result = await client.query<T>(text, params);
    return result.rows;
  } catch (error) {
    logger.error("db_query_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
