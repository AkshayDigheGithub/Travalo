/** Coarse regions, used to give sample flights plausible durations. */
export type Region =
  | "south-asia"
  | "middle-east"
  | "southeast-asia"
  | "east-asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "oceania"
  | "africa";

const REGION_BY_COUNTRY: Record<string, Region> = {
  IN: "south-asia",
  LK: "south-asia",
  MV: "south-asia",
  NP: "south-asia",
  AE: "middle-east",
  QA: "middle-east",
  SA: "middle-east",
  KW: "middle-east",
  OM: "middle-east",
  BH: "middle-east",
  IL: "middle-east",
  JO: "middle-east",
  TR: "middle-east",
  SG: "southeast-asia",
  TH: "southeast-asia",
  MY: "southeast-asia",
  ID: "southeast-asia",
  PH: "southeast-asia",
  VN: "southeast-asia",
  HK: "east-asia",
  JP: "east-asia",
  KR: "east-asia",
  CN: "east-asia",
  TW: "east-asia",
  GB: "europe",
  FR: "europe",
  NL: "europe",
  DE: "europe",
  ES: "europe",
  IT: "europe",
  PT: "europe",
  CH: "europe",
  AT: "europe",
  DK: "europe",
  SE: "europe",
  NO: "europe",
  FI: "europe",
  IE: "europe",
  CZ: "europe",
  HU: "europe",
  PL: "europe",
  GR: "europe",
  US: "north-america",
  CA: "north-america",
  MX: "north-america",
  BR: "south-america",
  AR: "south-america",
  CL: "south-america",
  PE: "south-america",
  CO: "south-america",
  AU: "oceania",
  NZ: "oceania",
  ZA: "africa",
  KE: "africa",
  EG: "africa",
  MA: "africa",
  ET: "africa",
  NG: "africa",
};

export function regionFor(countryCode: string): Region {
  return REGION_BY_COUNTRY[countryCode.toUpperCase()] ?? "europe";
}

/**
 * Illustrative non-stop block time in minutes between two regions. Real block
 * times vary by route; this only needs to make sample results read plausibly.
 */
export function baseDurationMinutes(from: Region, to: Region, sameCountry: boolean): number {
  if (sameCountry) return 115;
  if (from === to) return 210;

  const NEIGHBOURS: Partial<Record<Region, Region[]>> = {
    "south-asia": ["middle-east", "southeast-asia"],
    "middle-east": ["south-asia", "europe", "africa"],
    "southeast-asia": ["south-asia", "east-asia", "oceania"],
    "east-asia": ["southeast-asia", "oceania"],
    europe: ["middle-east", "africa"],
    africa: ["europe", "middle-east"],
    "north-america": ["south-america"],
    "south-america": ["north-america"],
    oceania: ["southeast-asia", "east-asia"],
  };

  if (NEIGHBOURS[from]?.includes(to)) return 240;
  return 720;
}

/** Carriers that plausibly serve a region pair, for sample results. */
export function airlinePool(from: Region, to: Region): string[] {
  const pools: Partial<Record<Region, string[]>> = {
    "south-asia": ["AI", "6E", "UK", "IX", "SG"],
    "middle-east": ["EK", "EY", "QR", "FZ", "GF", "WY", "TK"],
    "southeast-asia": ["SQ", "TG", "MH", "AK", "TR", "VJ", "GA"],
    "east-asia": ["CX", "JL", "NH", "KE", "BR", "CI"],
    europe: ["BA", "AF", "KL", "LH", "LX", "AY", "TP", "VS"],
    "north-america": ["AA", "DL", "UA", "AC", "B6"],
    "south-america": ["LA", "AV", "CM", "AR"],
    oceania: ["QF", "NZ", "VA", "JQ"],
    africa: ["ET", "KQ", "MS", "SA", "AT"],
  };

  const combined = [...(pools[from] ?? []), ...(pools[to] ?? [])];
  // Global connectors show up on most long-haul routes.
  if (from !== to) combined.push("EK", "QR", "TK");
  return [...new Set(combined)];
}
