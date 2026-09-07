/** URL-safe slug: lowercase, ASCII-folded, hyphen separated. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/**
 * Hotel URLs read as `/hotels/atlantis-the-palm-12345`. The trailing numeric
 * id is what we resolve against the provider, so the human part can change
 * without breaking links.
 */
export function hotelSlug(name: string, id: string | number): string {
  const base = slugify(name);
  return base ? `${base}-${id}` : String(id);
}

/** Pulls the provider id back out of a `name-12345` style slug. */
export function hotelIdFromSlug(slug: string): string | null {
  const match = /-(\d+)$/.exec(slug);
  return match ? match[1] : null;
}
