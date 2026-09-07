import "server-only";

import { Redis } from "@upstash/redis";

import { serverEnv } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Optional cache. Upstash Redis is used when configured (the right fit for
 * Vercel's serverless runtime); otherwise a small per-instance memory cache
 * keeps repeated searches cheap without making Redis a setup requirement.
 */

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = serverEnv.upstashUrl;
  const token = serverEnv.upstashToken;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

type MemoryEntry = { value: unknown; expiresAt: number };

const MEMORY_LIMIT = 300;
const memory = new Map<string, MemoryEntry>();

function memoryGet<T>(key: string): T | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  // Refresh insertion order so the map behaves as a simple LRU.
  memory.delete(key);
  memory.set(key, entry);
  return entry.value as T;
}

function memorySet(key: string, value: unknown, ttlSeconds: number) {
  if (memory.size >= MEMORY_LIMIT) {
    const oldest = memory.keys().next().value;
    if (oldest !== undefined) memory.delete(oldest);
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return memoryGet<T>(key);

  try {
    return ((await client.get<T>(key)) as T) ?? null;
  } catch (error) {
    logger.warn("cache_get_failed", { key, error: String(error) });
    return memoryGet<T>(key);
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (!client) {
    memorySet(key, value, ttlSeconds);
    return;
  }

  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    logger.warn("cache_set_failed", { key, error: String(error) });
    memorySet(key, value, ttlSeconds);
  }
}

/** Read-through helper used by the search adapters. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  produce: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await produce();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

/**
 * Fixed-window rate limit. Falls back to per-instance counting when Redis is
 * absent — good enough to blunt accidental hammering of the provider quota.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedis();
  const bucket = `rl:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;

  if (!client) {
    const current = (memoryGet<number>(bucket) ?? 0) + 1;
    memorySet(bucket, current, windowSeconds);
    return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
  }

  try {
    const count = await client.incr(bucket);
    if (count === 1) await client.expire(bucket, windowSeconds);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (error) {
    logger.warn("rate_limit_failed", { key, error: String(error) });
    // Never block real traffic because the limiter itself is down.
    return { allowed: true, remaining: limit };
  }
}
