/**
 * Structured server-side logging. Technical detail stays here; users only ever
 * see the sanitized messages produced by lib/errors.
 */
type Level = "debug" | "info" | "warn" | "error";

type Fields = Record<string, unknown>;

function emit(level: Level, event: string, fields: Fields = {}) {
  const line = JSON.stringify({
    level,
    event,
    at: new Date().toISOString(),
    ...fields,
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") {
    if (process.env.NODE_ENV !== "production") console.debug(line);
  } else console.info(line);
}

export const logger = {
  debug: (event: string, fields?: Fields) => emit("debug", event, fields),
  info: (event: string, fields?: Fields) => emit("info", event, fields),
  warn: (event: string, fields?: Fields) => emit("warn", event, fields),
  error: (event: string, fields?: Fields) => emit("error", event, fields),
};
