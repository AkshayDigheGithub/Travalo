const STORAGE_KEY = "tripora.aid";

/**
 * A random id scoped to the browser session. It is deliberately not persisted
 * across sessions and carries no personal information — it exists only to join
 * a search to the click that followed it.
 */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    // Private browsing modes can throw on storage access; analytics is optional.
    return "anonymous";
  }
}
