/**
 * Curated destination content.
 *
 * Deliberately a small, hand-written set rather than hundreds of generated
 * pages: each one is a real editorial page worth indexing. The database can
 * extend this list later without changing the page components.
 */
export type DestinationFaq = { question: string; answer: string };

export type Destination = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  /** Primary airport used for the "flights to" links. */
  airportCode: string;
  heroImage: string;
  tagline: string;
  intro: string;
  bestTimeToVisit: string;
  currency: string;
  areas: { name: string; description: string }[];
  travelInfo: { label: string; value: string }[];
  faqs: DestinationFaq[];
  featured: boolean;
};

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;

export const DESTINATIONS: Destination[] = [
  {
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    airportCode: "DXB",
    heroImage: IMG("photo-1512453979798-5ea266f8880c"),
    tagline: "Desert coastline, glass towers and a very good airport",
    intro:
      "Dubai works as a long weekend and as a stopover. The city is compact along the coast, the metro covers most of what visitors want, and flights arrive from almost everywhere — which is why fares here are among the most competitive in the region.",
    bestTimeToVisit:
      "November to March, when daytime temperatures sit in the mid-20s °C. July and August are very hot but hotel rates fall sharply.",
    currency: "AED",
    areas: [
      {
        name: "Downtown",
        description: "Burj Khalifa, the fountain and the largest mall. Best for first visits.",
      },
      { name: "Dubai Marina", description: "Waterfront restaurants, the beach walk and the tram." },
      {
        name: "Palm Jumeirah",
        description: "Resort territory — private beaches and the big hotels.",
      },
      { name: "Deira", description: "Old Dubai: the souks, the creek and much cheaper rooms." },
    ],
    travelInfo: [
      { label: "Main airport", value: "Dubai International (DXB)" },
      { label: "Getting around", value: "Metro, tram, taxis and ride hailing" },
      { label: "Language", value: "Arabic; English widely spoken" },
      { label: "Visa", value: "Requirements vary by nationality — check before booking" },
    ],
    faqs: [
      {
        question: "How many days do you need in Dubai?",
        answer:
          "Three to four days covers the landmarks, a desert trip and a beach day. A weekend works if you stay near the metro.",
      },
      {
        question: "When are flights to Dubai cheapest?",
        answer:
          "Fares generally soften in the summer months and around mid-week departures. Compare a few dates on the results page to see the pattern for your route.",
      },
      {
        question: "Is Dubai expensive?",
        answer:
          "It spans the full range. Deira and Al Barsha have inexpensive hotels; Palm Jumeirah and Downtown are where prices climb.",
      },
    ],
    featured: true,
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    countryCode: "FR",
    airportCode: "CDG",
    heroImage: IMG("photo-1502602898657-3e91760cbb34"),
    tagline: "Walkable, layered and best seen slowly",
    intro:
      "Paris rewards walking. The centre is small enough to cross on foot in an afternoon, and the neighbourhoods change character every few streets. Two airports serve the city, so it pays to compare both when you search.",
    bestTimeToVisit:
      "April to June and September to October: mild weather, long days and lower rates than the July–August peak.",
    currency: "EUR",
    areas: [
      { name: "Le Marais", description: "Narrow streets, galleries and the best casual eating." },
      { name: "Saint-Germain", description: "Bookshops, cafés and a short walk to the river." },
      {
        name: "Montmartre",
        description: "Steep, villagey and quieter at night than it looks by day.",
      },
      { name: "Canal Saint-Martin", description: "Where Parisians go on a warm evening." },
    ],
    travelInfo: [
      { label: "Main airports", value: "Charles de Gaulle (CDG), Orly (ORY)" },
      { label: "Getting around", value: "Métro, RER and a very good bike network" },
      { label: "Language", value: "French" },
      { label: "Visa", value: "Schengen area rules apply" },
    ],
    faqs: [
      {
        question: "Which Paris airport should I fly into?",
        answer:
          "Charles de Gaulle has the most long-haul routes; Orly is closer to the centre and often cheaper from within Europe. Compare both before booking.",
      },
      {
        question: "How far ahead should I book?",
        answer:
          "For summer travel, two to three months out is a reasonable window. Shoulder season is more forgiving.",
      },
    ],
    featured: true,
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    airportCode: "BKK",
    heroImage: IMG("photo-1508009603885-50cf7c579365"),
    tagline: "Street food, river boats and excellent value",
    intro:
      "Bangkok is loud, hot and one of the best-value cities in Asia. Two airports and a dense low-cost network make it easy to reach and easy to leave for the islands.",
    bestTimeToVisit:
      "November to February is the cool, dry season. April is the hottest month; the rains arrive around June.",
    currency: "THB",
    areas: [
      { name: "Riverside", description: "Temples, hotels on the water and the express boat." },
      { name: "Sukhumvit", description: "Skytrain access, malls and the widest choice of hotels." },
      { name: "Rattanakosin", description: "The old town — the Grand Palace and Wat Pho." },
      { name: "Ari", description: "Residential and low-key, with the best independent cafés." },
    ],
    travelInfo: [
      { label: "Main airports", value: "Suvarnabhumi (BKK), Don Mueang (DMK)" },
      { label: "Getting around", value: "BTS Skytrain, MRT, river boats" },
      { label: "Language", value: "Thai" },
      { label: "Visa", value: "Many nationalities get visa-free entry — verify before travel" },
    ],
    faqs: [
      {
        question: "Which Bangkok airport do low-cost airlines use?",
        answer:
          "Don Mueang (DMK) handles most low-cost traffic; Suvarnabhumi (BKK) handles most full-service and long-haul flights.",
      },
      {
        question: "Is Bangkok a good stopover?",
        answer:
          "Yes — it's a major connecting point between Europe, India and Australia, and a one- or two-night stop is easy to arrange.",
      },
    ],
    featured: true,
  },
  {
    slug: "singapore",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    airportCode: "SIN",
    heroImage: IMG("photo-1525625293386-3f8f99389edd"),
    tagline: "Compact, green and effortless to get around",
    intro:
      "Singapore is the easiest big city in Asia to visit: everything is close, the MRT reaches almost everywhere, and the food is extraordinary at every price point.",
    bestTimeToVisit:
      "Warm and humid year round. February to April is marginally drier; rates dip outside school holidays.",
    currency: "SGD",
    areas: [
      { name: "Marina Bay", description: "The waterfront, the gardens and the skyline views." },
      { name: "Chinatown", description: "Shophouses, hawker centres and good mid-range hotels." },
      { name: "Kampong Glam", description: "Independent shops around Haji Lane." },
      { name: "Sentosa", description: "Beaches and family attractions on the island." },
    ],
    travelInfo: [
      { label: "Main airport", value: "Changi (SIN)" },
      { label: "Getting around", value: "MRT, buses and ride hailing" },
      { label: "Language", value: "English, Malay, Mandarin, Tamil" },
      { label: "Visa", value: "Visa-free for many nationalities — check current rules" },
    ],
    faqs: [
      {
        question: "How long should I stop in Singapore?",
        answer: "Two full days covers the highlights comfortably; three if you want a beach day.",
      },
      {
        question: "Is Singapore good for a stopover?",
        answer:
          "Changi is one of the busiest connecting airports in Asia, and the city centre is around 25 minutes away by train.",
      },
    ],
    featured: true,
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    airportCode: "LHR",
    heroImage: IMG("photo-1513635269975-59663e0ac1ad"),
    tagline: "Six airports, endless neighbourhoods",
    intro:
      "London is a collection of villages that grew together. Free museums, a deep transport network and more inbound routes than almost anywhere make it easy to reach on a budget — if you compare airports.",
    bestTimeToVisit:
      "May, June and September are the best combination of weather and crowds. Winter is cheap and often clear.",
    currency: "GBP",
    areas: [
      { name: "Covent Garden", description: "Theatre district, central and busy." },
      { name: "South Bank", description: "River walk, galleries and the food market." },
      { name: "Shoreditch", description: "Bars, markets and independent design." },
      { name: "Kensington", description: "The big museums and quieter garden squares." },
    ],
    travelInfo: [
      { label: "Main airports", value: "Heathrow (LHR), Gatwick (LGW), Stansted, Luton, City" },
      { label: "Getting around", value: "Underground, Elizabeth line, buses" },
      { label: "Language", value: "English" },
      { label: "Visa", value: "UK entry rules apply — check before booking" },
    ],
    faqs: [
      {
        question: "Which London airport is cheapest?",
        answer:
          "It depends on the route. Stansted and Luton carry most low-cost European traffic; Heathrow has the widest long-haul choice. Search each and compare.",
      },
      {
        question: "Do I need to book museums in advance?",
        answer:
          "The permanent collections are free; special exhibitions usually need a timed ticket.",
      },
    ],
    featured: true,
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    airportCode: "HND",
    heroImage: IMG("photo-1540959733332-eab4deabeeaf"),
    tagline: "Enormous, orderly and endlessly detailed",
    intro:
      "Tokyo is best treated as several cities. Pick two or three districts, go deep, and let the trains do the rest — they are punctual to the minute and reach everywhere.",
    bestTimeToVisit:
      "Late March to April for blossom and October to November for autumn colour. Both are peak — book early.",
    currency: "JPY",
    areas: [
      {
        name: "Shinjuku",
        description: "Transport hub, nightlife and the government-building views.",
      },
      { name: "Shibuya", description: "The crossing, shopping and a young crowd." },
      { name: "Asakusa", description: "Senso-ji, the old town and traditional inns." },
      { name: "Nakameguro", description: "Canal-side, calm and full of small shops." },
    ],
    travelInfo: [
      { label: "Main airports", value: "Haneda (HND), Narita (NRT)" },
      { label: "Getting around", value: "JR lines, subway, IC card" },
      { label: "Language", value: "Japanese" },
      { label: "Visa", value: "Visa-free for many nationalities — verify before travel" },
    ],
    faqs: [
      {
        question: "Haneda or Narita?",
        answer:
          "Haneda is much closer to the centre and usually worth a small premium; Narita often has cheaper long-haul fares.",
      },
      {
        question: "How many days for a first trip?",
        answer: "Five nights in Tokyo is a comfortable first visit, with a day trip or two.",
      },
    ],
    featured: true,
  },
  {
    slug: "new-york",
    name: "New York",
    country: "United States",
    countryCode: "US",
    airportCode: "JFK",
    heroImage: IMG("photo-1496442226666-8d4d0e62e6e9"),
    tagline: "Three airports, one very walkable island",
    intro:
      "Manhattan is smaller than it looks on a map and the subway runs all night. Add Brooklyn for a day and you have a full trip.",
    bestTimeToVisit:
      "September to early November and April to June. January and February are the cheapest months to fly.",
    currency: "USD",
    areas: [
      { name: "Midtown", description: "Central, well connected, busy at all hours." },
      { name: "SoHo", description: "Cast-iron buildings, shopping and good food." },
      { name: "Upper West Side", description: "Quieter, near the park and the museums." },
      { name: "DUMBO", description: "Brooklyn waterfront with the classic skyline view." },
    ],
    travelInfo: [
      { label: "Main airports", value: "JFK, Newark (EWR), LaGuardia (LGA)" },
      { label: "Getting around", value: "Subway, buses, walking" },
      { label: "Language", value: "English" },
      { label: "Visa", value: "ESTA or a visa is required for most visitors" },
    ],
    faqs: [
      {
        question: "Which airport is most convenient?",
        answer:
          "LaGuardia and Newark are closer to Manhattan than JFK, but JFK usually has the widest international choice. Compare all three.",
      },
      {
        question: "Where should I stay for a first visit?",
        answer: "Midtown or the Upper West Side keep you close to the subway and the main sights.",
      },
    ],
    featured: true,
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    countryCode: "ID",
    airportCode: "DPS",
    heroImage: IMG("photo-1537996194471-e657df975ab4"),
    tagline: "Rice terraces, reef breaks and long stays",
    intro:
      "Bali is a whole island, not a single resort strip. The south has the airport and the nightlife, the centre has the terraces, and the east and north are much quieter.",
    bestTimeToVisit:
      "April to October is the dry season. January and February are the wettest and the cheapest.",
    currency: "IDR",
    areas: [
      { name: "Ubud", description: "Inland, green and the centre of the wellness scene." },
      { name: "Canggu", description: "Surf, cafés and a long-stay crowd." },
      { name: "Uluwatu", description: "Clifftop views and the best breaks." },
      { name: "Sanur", description: "Calm water and a gentler pace, good for families." },
    ],
    travelInfo: [
      { label: "Main airport", value: "Ngurah Rai (DPS)" },
      { label: "Getting around", value: "Scooters, private drivers, ride hailing" },
      { label: "Language", value: "Indonesian, Balinese" },
      { label: "Visa", value: "Visa on arrival for many nationalities — check current rules" },
    ],
    faqs: [
      {
        question: "How long should I stay in Bali?",
        answer: "Ten days lets you split the trip between the coast and Ubud without rushing.",
      },
      {
        question: "Is it cheaper to book flights and hotels separately?",
        answer:
          "Often, yes — which is why we search each independently and send you to the provider with the better price.",
      },
    ],
    featured: true,
  },
];

const BY_SLUG = new Map(DESTINATIONS.map((destination) => [destination.slug, destination]));

export function getDestination(slug: string): Destination | undefined {
  return BY_SLUG.get(slug);
}

export const FEATURED_DESTINATIONS = DESTINATIONS.filter((destination) => destination.featured);

/** Routes shown on the homepage; each links to a live, prefilled search. */
export const POPULAR_ROUTES = [
  { from: "BOM", to: "DXB", fromCity: "Mumbai", toCity: "Dubai" },
  { from: "DEL", to: "BKK", fromCity: "Delhi", toCity: "Bangkok" },
  { from: "BOM", to: "SIN", fromCity: "Mumbai", toCity: "Singapore" },
  { from: "DEL", to: "LHR", fromCity: "Delhi", toCity: "London" },
  { from: "BLR", to: "DXB", fromCity: "Bengaluru", toCity: "Dubai" },
  { from: "PNQ", to: "DXB", fromCity: "Pune", toCity: "Dubai" },
  { from: "MAA", to: "SIN", fromCity: "Chennai", toCity: "Singapore" },
  { from: "DEL", to: "JFK", fromCity: "Delhi", toCity: "New York" },
];

/** Destinations highlighted specifically for hotel search. */
export const HOTEL_DESTINATIONS = ["dubai", "paris", "bangkok", "singapore", "bali"];
