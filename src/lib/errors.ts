/**
 * A single error vocabulary shared by providers, route handlers and the UI.
 * Every user-facing string here is deliberately non-technical.
 */
export type AppErrorCode =
  | "invalid_input"
  | "not_found"
  | "provider_timeout"
  | "provider_unavailable"
  | "provider_malformed"
  | "rate_limited"
  | "not_configured"
  | "unknown";

const USER_MESSAGES: Record<AppErrorCode, string> = {
  invalid_input: "Some of those search details don't look right. Check them and try again.",
  not_found: "We couldn't find what you were looking for.",
  provider_timeout: "Our search partners are taking longer than usual. Please try again.",
  provider_unavailable: "Travel search is briefly unavailable. Please try again in a moment.",
  provider_malformed: "We couldn't read the results for that search. Please try again.",
  rate_limited: "That's a lot of searches. Give it a few seconds and try again.",
  not_configured: "Travel search isn't available right now.",
  unknown: "Something went wrong on our side. Please try again.",
};

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  invalid_input: 400,
  not_found: 404,
  provider_timeout: 504,
  provider_unavailable: 502,
  provider_malformed: 502,
  rate_limited: 429,
  not_configured: 503,
  unknown: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  /** Detail for server logs only — never returned to the browser. */
  readonly detail?: string;

  constructor(code: AppErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = "AppError";
    this.code = code;
    this.detail = detail;
  }

  get userMessage(): string {
    return USER_MESSAGES[this.code];
  }

  get status(): number {
    return STATUS_BY_CODE[this.code];
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new AppError("provider_timeout", error.message);
  }
  if (error instanceof Error) return new AppError("unknown", error.message);
  return new AppError("unknown", String(error));
}

export function userMessageFor(code: AppErrorCode): string {
  return USER_MESSAGES[code];
}
