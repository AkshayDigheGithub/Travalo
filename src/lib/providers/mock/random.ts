/**
 * Deterministic pseudo-randomness.
 *
 * Mock results must be stable for a given search: reloading /flights/results
 * should not reshuffle prices, and filtering must not change the data set.
 */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRandom(seed: string): () => number {
  let state = hashString(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length) % items.length];
}

export function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

export function intBetween(random: () => number, min: number, max: number): number {
  return Math.floor(between(random, min, max + 1));
}
