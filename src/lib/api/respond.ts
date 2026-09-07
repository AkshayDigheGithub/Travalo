import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimit } from "@/lib/cache";
import { AppError, toAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { toIssues, type ValidationIssue } from "@/lib/validation/common";

export type ApiErrorBody = {
  error: { code: string; message: string; issues?: ValidationIssue[] };
};

export function jsonOk<T>(data: T, init?: { headers?: Record<string, string> }) {
  return NextResponse.json(data, {
    headers: { "cache-control": "private, no-store", ...init?.headers },
  });
}

/**
 * Turns any thrown value into a sanitized response. The technical detail is
 * logged; the browser only ever receives the friendly message.
 */
export function jsonError(error: unknown, context: Record<string, unknown> = {}) {
  const appError = toAppError(error);

  if (appError.status >= 500 || appError.code === "rate_limited") {
    logger.error("api_error", { code: appError.code, detail: appError.detail, ...context });
  } else {
    logger.warn("api_client_error", { code: appError.code, detail: appError.detail, ...context });
  }

  const body: ApiErrorBody = {
    error: { code: appError.code, message: appError.userMessage },
  };

  return NextResponse.json(body, { status: appError.status });
}

export function validationError(error: z.ZodError) {
  const body: ApiErrorBody = {
    error: {
      code: "invalid_input",
      message: new AppError("invalid_input").userMessage,
      issues: toIssues(error),
    },
  };
  return NextResponse.json(body, { status: 400 });
}

/** Reads search params into a plain object for Zod. */
export function paramsToObject(url: URL): Record<string, string> {
  return Object.fromEntries(url.searchParams.entries());
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Per-IP fixed window limit. Protects the Travelpayouts quota from scraping and
 * accidental request storms without getting in a real user's way.
 */
export async function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const { allowed } = await rateLimit(`${bucket}:${clientKey(request)}`, limit, windowSeconds);
  if (!allowed) throw new AppError("rate_limited", `bucket=${bucket}`);
}
