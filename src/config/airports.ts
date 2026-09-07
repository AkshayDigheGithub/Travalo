import type { Place } from "@/types/search";

/**
 * Curated seed of major airports.
 *
 * The live product resolves places through the Travelpayouts autocomplete; this
 * list backs the mock provider, gives instant suggestions before the network
 * responds, and lets us label an IATA code ("PNQ") with a human place name.
 */
export type AirportSeed = {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
};

export const AIRPORTS: AirportSeed[] = [
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "DEL",
    name: "Indira Gandhi International Airport",
    city: "Delhi",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "PNQ",
    name: "Pune International Airport",
    city: "Pune",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "BLR",
    name: "Kempegowda International Airport",
    city: "Bengaluru",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "MAA",
    name: "Chennai International Airport",
    city: "Chennai",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "HYD",
    name: "Rajiv Gandhi International Airport",
    city: "Hyderabad",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "CCU",
    name: "Netaji Subhas Chandra Bose International Airport",
    city: "Kolkata",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "GOI",
    name: "Goa International Airport",
    city: "Goa",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "COK",
    name: "Cochin International Airport",
    city: "Kochi",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "AMD",
    name: "Sardar Vallabhbhai Patel International Airport",
    city: "Ahmedabad",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "JAI",
    name: "Jaipur International Airport",
    city: "Jaipur",
    country: "India",
    countryCode: "IN",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
  },
  {
    code: "AUH",
    name: "Zayed International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    countryCode: "AE",
  },
  {
    code: "SHJ",
    name: "Sharjah International Airport",
    city: "Sharjah",
    country: "United Arab Emirates",
    countryCode: "AE",
  },
  {
    code: "DOH",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
    countryCode: "QA",
  },
  {
    code: "RUH",
    name: "King Khalid International Airport",
    city: "Riyadh",
    country: "Saudi Arabia",
    countryCode: "SA",
  },
  {
    code: "JED",
    name: "King Abdulaziz International Airport",
    city: "Jeddah",
    country: "Saudi Arabia",
    countryCode: "SA",
  },
  {
    code: "KWI",
    name: "Kuwait International Airport",
    city: "Kuwait City",
    country: "Kuwait",
    countryCode: "KW",
  },
  {
    code: "MCT",
    name: "Muscat International Airport",
    city: "Muscat",
    country: "Oman",
    countryCode: "OM",
  },
  {
    code: "BAH",
    name: "Bahrain International Airport",
    city: "Manama",
    country: "Bahrain",
    countryCode: "BH",
  },
  {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
  },
  {
    code: "BKK",
    name: "Suvarnabhumi Airport",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
  },
  {
    code: "DMK",
    name: "Don Mueang International Airport",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
  },
  {
    code: "HKT",
    name: "Phuket International Airport",
    city: "Phuket",
    country: "Thailand",
    countryCode: "TH",
  },
  {
    code: "KUL",
    name: "Kuala Lumpur International Airport",
    city: "Kuala Lumpur",
    country: "Malaysia",
    countryCode: "MY",
  },
  {
    code: "DPS",
    name: "Ngurah Rai International Airport",
    city: "Bali",
    country: "Indonesia",
    countryCode: "ID",
  },
  {
    code: "CGK",
    name: "Soekarno-Hatta International Airport",
    city: "Jakarta",
    country: "Indonesia",
    countryCode: "ID",
  },
  {
    code: "HKG",
    name: "Hong Kong International Airport",
    city: "Hong Kong",
    country: "Hong Kong",
    countryCode: "HK",
  },
  {
    code: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
  },
  { code: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan", countryCode: "JP" },
  {
    code: "KIX",
    name: "Kansai International Airport",
    city: "Osaka",
    country: "Japan",
    countryCode: "JP",
  },
  {
    code: "ICN",
    name: "Incheon International Airport",
    city: "Seoul",
    country: "South Korea",
    countryCode: "KR",
  },
  {
    code: "PVG",
    name: "Shanghai Pudong International Airport",
    city: "Shanghai",
    country: "China",
    countryCode: "CN",
  },
  {
    code: "PEK",
    name: "Beijing Capital International Airport",
    city: "Beijing",
    country: "China",
    countryCode: "CN",
  },
  {
    code: "TPE",
    name: "Taiwan Taoyuan International Airport",
    city: "Taipei",
    country: "Taiwan",
    countryCode: "TW",
  },
  {
    code: "MNL",
    name: "Ninoy Aquino International Airport",
    city: "Manila",
    country: "Philippines",
    countryCode: "PH",
  },
  {
    code: "SGN",
    name: "Tan Son Nhat International Airport",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    countryCode: "VN",
  },
  {
    code: "HAN",
    name: "Noi Bai International Airport",
    city: "Hanoi",
    country: "Vietnam",
    countryCode: "VN",
  },
  {
    code: "CMB",
    name: "Bandaranaike International Airport",
    city: "Colombo",
    country: "Sri Lanka",
    countryCode: "LK",
  },
  {
    code: "MLE",
    name: "Velana International Airport",
    city: "Malé",
    country: "Maldives",
    countryCode: "MV",
  },
  {
    code: "KTM",
    name: "Tribhuvan International Airport",
    city: "Kathmandu",
    country: "Nepal",
    countryCode: "NP",
  },
  {
    code: "LHR",
    name: "Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
  },
  {
    code: "LGW",
    name: "Gatwick Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
  },
  {
    code: "MAN",
    name: "Manchester Airport",
    city: "Manchester",
    country: "United Kingdom",
    countryCode: "GB",
  },
  {
    code: "EDI",
    name: "Edinburgh Airport",
    city: "Edinburgh",
    country: "United Kingdom",
    countryCode: "GB",
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    countryCode: "FR",
  },
  { code: "ORY", name: "Orly Airport", city: "Paris", country: "France", countryCode: "FR" },
  {
    code: "NCE",
    name: "Nice Côte d'Azur Airport",
    city: "Nice",
    country: "France",
    countryCode: "FR",
  },
  {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
  },
  {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
  },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", countryCode: "DE" },
  {
    code: "BER",
    name: "Berlin Brandenburg Airport",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
  },
  {
    code: "MAD",
    name: "Adolfo Suárez Madrid-Barajas Airport",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
  },
  {
    code: "BCN",
    name: "Josep Tarradellas Barcelona-El Prat Airport",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
  },
  {
    code: "FCO",
    name: "Leonardo da Vinci-Fiumicino Airport",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
  },
  {
    code: "MXP",
    name: "Milan Malpensa Airport",
    city: "Milan",
    country: "Italy",
    countryCode: "IT",
  },
  {
    code: "VCE",
    name: "Venice Marco Polo Airport",
    city: "Venice",
    country: "Italy",
    countryCode: "IT",
  },
  {
    code: "LIS",
    name: "Humberto Delgado Airport",
    city: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
  },
  {
    code: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
  },
  {
    code: "GVA",
    name: "Geneva Airport",
    city: "Geneva",
    country: "Switzerland",
    countryCode: "CH",
  },
  {
    code: "VIE",
    name: "Vienna International Airport",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
  },
  {
    code: "CPH",
    name: "Copenhagen Airport",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
  },
  {
    code: "ARN",
    name: "Stockholm Arlanda Airport",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
  },
  { code: "OSL", name: "Oslo Airport", city: "Oslo", country: "Norway", countryCode: "NO" },
  {
    code: "HEL",
    name: "Helsinki-Vantaa Airport",
    city: "Helsinki",
    country: "Finland",
    countryCode: "FI",
  },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland", countryCode: "IE" },
  {
    code: "PRG",
    name: "Václav Havel Airport Prague",
    city: "Prague",
    country: "Czechia",
    countryCode: "CZ",
  },
  {
    code: "BUD",
    name: "Budapest Ferenc Liszt International Airport",
    city: "Budapest",
    country: "Hungary",
    countryCode: "HU",
  },
  {
    code: "WAW",
    name: "Warsaw Chopin Airport",
    city: "Warsaw",
    country: "Poland",
    countryCode: "PL",
  },
  {
    code: "ATH",
    name: "Athens International Airport",
    city: "Athens",
    country: "Greece",
    countryCode: "GR",
  },
  {
    code: "IST",
    name: "Istanbul Airport",
    city: "Istanbul",
    country: "Türkiye",
    countryCode: "TR",
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "EWR",
    name: "Newark Liberty International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "SEA",
    name: "Seattle-Tacoma International Airport",
    city: "Seattle",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "BOS",
    name: "Logan International Airport",
    city: "Boston",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "IAD",
    name: "Washington Dulles International Airport",
    city: "Washington",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "LAS",
    name: "Harry Reid International Airport",
    city: "Las Vegas",
    country: "United States",
    countryCode: "US",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
  },
  {
    code: "YVR",
    name: "Vancouver International Airport",
    city: "Vancouver",
    country: "Canada",
    countryCode: "CA",
  },
  {
    code: "YUL",
    name: "Montréal-Trudeau International Airport",
    city: "Montreal",
    country: "Canada",
    countryCode: "CA",
  },
  {
    code: "MEX",
    name: "Mexico City International Airport",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
  },
  {
    code: "GRU",
    name: "São Paulo/Guarulhos International Airport",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
  },
  {
    code: "GIG",
    name: "Rio de Janeiro/Galeão International Airport",
    city: "Rio de Janeiro",
    country: "Brazil",
    countryCode: "BR",
  },
  {
    code: "EZE",
    name: "Ministro Pistarini International Airport",
    city: "Buenos Aires",
    country: "Argentina",
    countryCode: "AR",
  },
  {
    code: "SCL",
    name: "Arturo Merino Benítez International Airport",
    city: "Santiago",
    country: "Chile",
    countryCode: "CL",
  },
  {
    code: "LIM",
    name: "Jorge Chávez International Airport",
    city: "Lima",
    country: "Peru",
    countryCode: "PE",
  },
  {
    code: "BOG",
    name: "El Dorado International Airport",
    city: "Bogotá",
    country: "Colombia",
    countryCode: "CO",
  },
  {
    code: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
  },
  {
    code: "MEL",
    name: "Melbourne Airport",
    city: "Melbourne",
    country: "Australia",
    countryCode: "AU",
  },
  {
    code: "BNE",
    name: "Brisbane Airport",
    city: "Brisbane",
    country: "Australia",
    countryCode: "AU",
  },
  { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia", countryCode: "AU" },
  {
    code: "AKL",
    name: "Auckland Airport",
    city: "Auckland",
    country: "New Zealand",
    countryCode: "NZ",
  },
  {
    code: "JNB",
    name: "O. R. Tambo International Airport",
    city: "Johannesburg",
    country: "South Africa",
    countryCode: "ZA",
  },
  {
    code: "CPT",
    name: "Cape Town International Airport",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
  },
  {
    code: "NBO",
    name: "Jomo Kenyatta International Airport",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
  },
  {
    code: "CAI",
    name: "Cairo International Airport",
    city: "Cairo",
    country: "Egypt",
    countryCode: "EG",
  },
  {
    code: "CMN",
    name: "Mohammed V International Airport",
    city: "Casablanca",
    country: "Morocco",
    countryCode: "MA",
  },
  {
    code: "ADD",
    name: "Bole International Airport",
    city: "Addis Ababa",
    country: "Ethiopia",
    countryCode: "ET",
  },
  {
    code: "LOS",
    name: "Murtala Muhammed International Airport",
    city: "Lagos",
    country: "Nigeria",
    countryCode: "NG",
  },
  {
    code: "TLV",
    name: "Ben Gurion Airport",
    city: "Tel Aviv",
    country: "Israel",
    countryCode: "IL",
  },
  {
    code: "AMM",
    name: "Queen Alia International Airport",
    city: "Amman",
    country: "Jordan",
    countryCode: "JO",
  },
];

const BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

export function findAirport(code: string): AirportSeed | undefined {
  return BY_CODE.get(code.toUpperCase());
}

/** "Mumbai" when we know the code, otherwise the code itself. */
export function cityNameForCode(code: string): string {
  return findAirport(code)?.city ?? code.toUpperCase();
}

export function airportToPlace(airport: AirportSeed): Place {
  return {
    code: airport.code,
    type: "airport",
    name: airport.name,
    cityName: airport.city,
    countryName: airport.country,
    countryCode: airport.countryCode,
  };
}

/** Simple ranked local match used by the mock provider and offline fallback. */
export function searchAirportSeed(term: string, limit = 8): Place[] {
  const query = term.trim().toLowerCase();
  if (!query) return [];

  return AIRPORTS.map((airport) => {
    const code = airport.code.toLowerCase();
    const city = airport.city.toLowerCase();
    const name = airport.name.toLowerCase();

    let score = -1;
    if (code === query) score = 0;
    else if (city.startsWith(query)) score = 1;
    else if (name.startsWith(query)) score = 2;
    else if (city.includes(query)) score = 3;
    else if (name.includes(query)) score = 4;
    else if (airport.country.toLowerCase().startsWith(query)) score = 5;

    return { airport, score };
  })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => a.score - b.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, limit)
    .map((entry) => airportToPlace(entry.airport));
}
