import { slugify } from "@/lib/utils/slug";

/**
 * Curated flight-route content.
 *
 * "Flights from A to B" is the single largest search family in travel, and it
 * is the one query a metasearch can answer better than a blog can. These pages
 * exist to be that answer.
 *
 * Deliberately hand-written and deliberately finite, for the same reason the
 * destination guides are: 109 airports would permit ~11,700 permutations, and a
 * generated page for each would be thin, near-duplicate content of exactly the
 * kind search engines demote. Every entry here carries facts someone actually
 * wants — who flies it nonstop, how long it takes, when fares soften — and the
 * set spans regions so the site reads as a global product rather than an Indian
 * one with a global search box.
 *
 * `dynamicParams = false` on the route page means anything not in this list is a
 * 404, so the indexable surface can never drift beyond what is written here.
 */
export type RouteFaq = { question: string; answer: string };

export type FlightRoute = {
  /** IATA codes; these are what the search form and provider are given. */
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  fromCountry: string;
  toCountry: string;
  /** Great-circle distance, rounded to the nearest 10 km. */
  distanceKm: number;
  /** Typical scheduled nonstop block time, or undefined when nobody flies it nonstop. */
  nonstopDuration?: string;
  /** Carriers that operate the route nonstop, or the usual one-stop options. */
  airlines: string[];
  /** Two or three sentences of genuine orientation — not marketing copy. */
  intro: string;
  /** When fares on this specific route tend to soften. */
  cheapestTime: string;
  /** How far ahead to book for this route's demand pattern. */
  whenToBook: string;
  airportTips: { label: string; value: string }[];
  faqs: RouteFaq[];
  /** Destination guide to link to, when one exists for the arrival city. */
  destinationSlug?: string;
  /** Bumped when the copy changes; drives sitemap lastmod. */
  updatedAt: string;
};

export const FLIGHT_ROUTES: FlightRoute[] = [
  {
    from: "LHR",
    to: "JFK",
    fromCity: "London",
    toCity: "New York",
    fromCountry: "United Kingdom",
    toCountry: "United States",
    distanceKm: 5550,
    nonstopDuration: "7h 55m – 8h 30m westbound, 6h 30m – 7h 15m eastbound",
    airlines: [
      "British Airways",
      "Virgin Atlantic",
      "American Airlines",
      "Delta Air Lines",
      "United Airlines",
      "JetBlue",
    ],
    intro:
      "The busiest long-haul route in the world by revenue, and the most competitive. Six airlines fly London to New York nonstop, several of them many times a day, which is why fares move so much between departures on the same date. Eastbound flights are notably shorter than westbound ones because of the jet stream.",
    cheapestTime:
      "January to early March, and the second half of November, are the softest weeks. July, August and the fortnight around Christmas are the peak.",
    whenToBook:
      "Two to four months ahead for summer travel. Because capacity is so large, last-minute fares fall more often here than on thinner routes — though not reliably enough to plan around.",
    airportTips: [
      {
        label: "London airports",
        value:
          "Heathrow (LHR) has the most nonstops; Gatwick (LGW) and Stansted (STN) add lower-cost options",
      },
      {
        label: "New York airports",
        value:
          "JFK for the widest choice, Newark (EWR) often cheaper and closer to Manhattan by car",
      },
      {
        label: "Terminal",
        value: "Most transatlantic departures leave Heathrow from Terminals 3 and 5",
      },
    ],
    faqs: [
      {
        question: "How long is the flight from London to New York?",
        answer:
          "Around 8 hours westbound and closer to 7 hours on the return, because the jet stream pushes eastbound aircraft along. Schedules quote 7h 55m to 8h 30m for the outbound leg.",
      },
      {
        question: "Which is cheaper, JFK or Newark?",
        answer:
          "Newark is frequently a little cheaper and is served by United and several partners. Compare both — the results page shows them side by side when you search New York rather than a single airport.",
      },
      {
        question: "When are London to New York flights cheapest?",
        answer:
          "Mid-January through early March is the reliable low season. Fares climb from June and peak through August and again around Christmas.",
      },
    ],
    destinationSlug: "new-york",
    updatedAt: "2026-09-08",
  },
  {
    from: "JFK",
    to: "LHR",
    fromCity: "New York",
    toCity: "London",
    fromCountry: "United States",
    toCountry: "United Kingdom",
    distanceKm: 5550,
    nonstopDuration: "6h 30m – 7h 15m",
    airlines: [
      "British Airways",
      "Virgin Atlantic",
      "American Airlines",
      "Delta Air Lines",
      "United Airlines",
      "JetBlue",
    ],
    intro:
      "Eastbound transatlantic flights ride the jet stream, so New York to London runs about an hour shorter than the return. Nearly all departures leave in the evening and land in London the following morning, which makes this a route where the overnight schedule, not the fare alone, decides how usable the first day is.",
    cheapestTime:
      "Late January to March, and the first three weeks of November. Avoid the last week of June through August.",
    whenToBook:
      "Two to three months out. Award-seat and sale fares on this route appear year-round because six carriers compete on it.",
    airportTips: [
      {
        label: "Departure airports",
        value: "JFK and Newark (EWR) both have multiple daily nonstops",
      },
      {
        label: "Arrival",
        value:
          "Heathrow (LHR) is the main arrival; the Elizabeth line reaches central London in about 35 minutes",
      },
      {
        label: "Overnight flights",
        value: "Most departures are between 18:00 and 22:00, arriving early the next morning",
      },
    ],
    faqs: [
      {
        question: "How long does New York to London take?",
        answer:
          "Typically 6h 30m to 7h 15m nonstop. The eastbound crossing is shorter than westbound because of prevailing tailwinds.",
      },
      {
        question: "Do all flights arrive in the morning?",
        answer:
          "Most do. Evening departures from New York land in London between 06:00 and 10:00, so plan on a short first day rather than a full one.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "BOM",
    to: "DXB",
    fromCity: "Mumbai",
    toCity: "Dubai",
    fromCountry: "India",
    toCountry: "United Arab Emirates",
    distanceKm: 1930,
    nonstopDuration: "3h 15m – 3h 30m",
    airlines: ["Emirates", "IndiGo", "Air India", "Air India Express", "flydubai", "Akasa Air"],
    intro:
      "One of the highest-frequency international routes anywhere, with departures throughout the day and night. The mix of a full-service carrier, several low-cost operators and a large expatriate travel market keeps fares low relative to the distance, but they swing hard around the Indian holiday calendar.",
    cheapestTime:
      "May to early September, when Gulf summer heat suppresses leisure demand. Fares spike around Diwali, Christmas and the Eid holidays.",
    whenToBook:
      "Three to six weeks ahead is usually enough on a route with this much capacity, but book two to three months out for travel in the Diwali or year-end windows.",
    airportTips: [
      {
        label: "Mumbai terminal",
        value: "International departures use Terminal 2 at Chhatrapati Shivaji Maharaj (BOM)",
      },
      {
        label: "Dubai terminals",
        value: "Emirates uses Terminal 3; flydubai and most Indian carriers use Terminals 2 and 3",
      },
      {
        label: "Alternative",
        value: "Sharjah (SHJ) is often cheaper and about an hour from central Dubai",
      },
    ],
    faqs: [
      {
        question: "How long is the Mumbai to Dubai flight?",
        answer: "About 3 hours 15 minutes to 3 hours 30 minutes nonstop.",
      },
      {
        question: "Which airlines fly Mumbai to Dubai nonstop?",
        answer:
          "Emirates, IndiGo, Air India, Air India Express, flydubai and Akasa Air all operate the route, most of them several times daily.",
      },
      {
        question: "Do I need a visa for Dubai?",
        answer:
          "Requirements depend on your nationality; several passports are eligible for visa on arrival and others must apply in advance. Check with the UAE authorities before booking.",
      },
    ],
    destinationSlug: "dubai",
    updatedAt: "2026-09-08",
  },
  {
    from: "DEL",
    to: "LHR",
    fromCity: "Delhi",
    toCity: "London",
    fromCountry: "India",
    toCountry: "United Kingdom",
    distanceKm: 6700,
    nonstopDuration: "9h – 9h 30m",
    airlines: ["Air India", "British Airways", "Virgin Atlantic", "IndiGo"],
    intro:
      "The main India–UK trunk route, flown nonstop by both flag carriers and, increasingly, by Indian low-cost operators on widebody aircraft. One-stop options through the Gulf are often cheaper and add three to five hours, so this is a route where the fare and the clock genuinely trade against each other.",
    cheapestTime:
      "February to April and late September to early November. Peak demand runs June to August and across the Christmas and New Year weeks.",
    whenToBook:
      "Three to five months ahead for summer. Gulf-connecting fares stay flexible later, but nonstop seats in July and August sell out early.",
    airportTips: [
      {
        label: "Delhi terminal",
        value: "International departures use Terminal 3 at Indira Gandhi (DEL)",
      },
      {
        label: "London options",
        value: "Heathrow (LHR) for nonstops; Gatwick (LGW) appears on some one-stop itineraries",
      },
      {
        label: "One-stop routings",
        value: "Dubai, Doha and Abu Dhabi are the common connecting points",
      },
    ],
    faqs: [
      {
        question: "How long is the Delhi to London flight?",
        answer:
          "Around 9 to 9 and a half hours nonstop. Itineraries connecting through the Gulf typically total 13 to 16 hours.",
      },
      {
        question: "Is it cheaper to fly with a stopover?",
        answer:
          "Usually yes. Gulf carriers connecting through Dubai, Doha or Abu Dhabi tend to undercut the nonstop fare, particularly outside the summer peak.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "DXB",
    to: "LHR",
    fromCity: "Dubai",
    toCity: "London",
    fromCountry: "United Arab Emirates",
    toCountry: "United Kingdom",
    distanceKm: 5500,
    nonstopDuration: "7h 30m – 8h",
    airlines: ["Emirates", "British Airways", "Virgin Atlantic"],
    intro:
      "A high-frequency business and leisure corridor with several departures a day, including the A380 services Emirates is best known for. Because so much of the traffic is connecting onward from Dubai, fares priced purely for the Dubai–London leg can be very competitive.",
    cheapestTime:
      "June to August, when Gulf outbound demand drops. December and the spring school holidays are the peak.",
    whenToBook: "Six to ten weeks out is generally sufficient outside the December peak.",
    airportTips: [
      {
        label: "Dubai terminal",
        value: "Emirates departs from Terminal 3; British Airways and Virgin use Terminal 1",
      },
      { label: "London arrivals", value: "Heathrow (LHR) and Gatwick (LGW) both receive nonstops" },
      {
        label: "Aircraft",
        value: "Several daily departures are operated by A380 or 777 widebodies",
      },
    ],
    faqs: [
      {
        question: "How long is Dubai to London?",
        answer: "Roughly 7 hours 30 minutes to 8 hours nonstop, westbound.",
      },
      {
        question: "How many flights a day are there?",
        answer:
          "Emirates alone operates multiple daily departures to Heathrow and Gatwick, with British Airways and Virgin Atlantic adding more.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "SIN",
    to: "LHR",
    fromCity: "Singapore",
    toCity: "London",
    fromCountry: "Singapore",
    toCountry: "United Kingdom",
    distanceKm: 10880,
    nonstopDuration: "13h 30m – 14h 30m",
    airlines: ["Singapore Airlines", "British Airways", "Qantas"],
    intro:
      "One of the longest widely flown nonstop routes, and the surviving segment of the old Kangaroo Route between Australia and Europe. Most departures leave Singapore late at night and arrive in London early the same morning, which makes the westbound leg an unusually long night flight.",
    cheapestTime:
      "February to April and October to early November. Fares rise steeply for the December holidays and the July–August European summer.",
    whenToBook:
      "Four to six months ahead for December travel; two to three months is workable in the shoulder seasons.",
    airportTips: [
      { label: "Singapore terminal", value: "Singapore Airlines uses Terminal 3 at Changi (SIN)" },
      {
        label: "London arrivals",
        value: "Heathrow (LHR) receives all nonstops; Gatwick appears on one-stop itineraries",
      },
      {
        label: "Onward",
        value: "Many passengers continue to Sydney or Melbourne on the same ticket",
      },
    ],
    faqs: [
      {
        question: "How long is Singapore to London nonstop?",
        answer: "Between 13 and a half and 14 and a half hours, depending on winds and routing.",
      },
      {
        question: "Is a stopover in Singapore worth it?",
        answer:
          "If you are travelling between Australia and Europe, a Singapore stopover breaks a 22-hour journey into two manageable legs and often costs no more than a straight connection.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "SYD",
    to: "LAX",
    fromCity: "Sydney",
    toCity: "Los Angeles",
    fromCountry: "Australia",
    toCountry: "United States",
    distanceKm: 12050,
    nonstopDuration: "13h – 14h eastbound, 14h 30m – 15h 30m westbound",
    airlines: ["Qantas", "United Airlines", "Delta Air Lines", "American Airlines"],
    intro:
      "The main Australia–North America gateway, and a route with an unusual quirk: flying east across the date line you arrive in Los Angeles before you left Sydney by the calendar. Departures cluster in the late morning and early afternoon from Sydney, landing the same morning in California.",
    cheapestTime:
      "May to early June, and again February to March. December and January are Australian summer holidays and price accordingly.",
    whenToBook:
      "Four to six months ahead for December and January. Southern-hemisphere winter departures can be found much closer in.",
    airportTips: [
      {
        label: "Sydney terminal",
        value: "International departures use Terminal 1 at Kingsford Smith (SYD)",
      },
      { label: "Los Angeles", value: "Nonstops arrive at LAX Tom Bradley International Terminal" },
      {
        label: "Date line",
        value:
          "Eastbound you arrive on the same calendar day you departed; westbound you lose a day",
      },
    ],
    faqs: [
      {
        question: "How long is Sydney to Los Angeles?",
        answer:
          "About 13 to 14 hours eastbound. The return leg to Sydney is longer, usually 14 and a half to 15 and a half hours.",
      },
      {
        question: "Why do I arrive before I left?",
        answer:
          "The route crosses the international date line eastbound, so local arrival time in Los Angeles falls on the same calendar day as the Sydney departure.",
      },
    ],
    updatedAt: "2026-09-08",
  },
  {
    from: "CDG",
    to: "JFK",
    fromCity: "Paris",
    toCity: "New York",
    fromCountry: "France",
    toCountry: "United States",
    distanceKm: 5830,
    nonstopDuration: "8h – 8h 45m",
    airlines: [
      "Air France",
      "Delta Air Lines",
      "American Airlines",
      "United Airlines",
      "French bee",
      "Norse Atlantic",
    ],
    intro:
      "A dense transatlantic route served by both legacy carriers and low-cost long-haul operators, which is why the spread between the cheapest and most expensive seat on the same day is so wide. Paris has two airports and New York has three, so the search matters more here than the airline does.",
    cheapestTime:
      "November to March excluding the Christmas weeks. Fares climb sharply from late May through August.",
    whenToBook: "Two to four months out for summer; six weeks is usually enough in winter.",
    airportTips: [
      {
        label: "Paris airports",
        value:
          "Charles de Gaulle (CDG) has the nonstops; Orly (ORY) serves some low-cost transatlantic flights",
      },
      {
        label: "New York airports",
        value: "JFK, Newark (EWR) and occasionally low-cost arrivals elsewhere in the region",
      },
      {
        label: "Low-cost carriers",
        value:
          "French bee and Norse Atlantic price bags and meals separately — compare the total, not the headline",
      },
    ],
    faqs: [
      {
        question: "How long is Paris to New York?",
        answer:
          "Around 8 to 8 hours 45 minutes nonstop westbound; about an hour less on the return.",
      },
      {
        question: "Are the low-cost transatlantic fares actually cheaper?",
        answer:
          "Often, but they unbundle checked bags, seat selection and meals. Add those back before comparing with a legacy carrier's fare.",
      },
    ],
    destinationSlug: "new-york",
    updatedAt: "2026-09-08",
  },
  {
    from: "DEL",
    to: "BKK",
    fromCity: "Delhi",
    toCity: "Bangkok",
    fromCountry: "India",
    toCountry: "Thailand",
    distanceKm: 2920,
    nonstopDuration: "4h 15m – 4h 45m",
    airlines: ["Thai Airways", "IndiGo", "Air India", "Thai AirAsia", "Vietjet Air"],
    intro:
      "A short, heavily served hop that functions as India's main gateway to Southeast Asia. Low-cost carriers dominate the fare picture, and because Bangkok is itself a connecting hub, onward fares to Phuket, Bali or Vietnam are often barely more than the Bangkok fare alone.",
    cheapestTime:
      "April to June and September to October, outside both the Indian holiday season and the Thai high season. December and January are the peak.",
    whenToBook:
      "Four to eight weeks ahead. Low-cost seat sales on this route appear regularly and are worth waiting for outside peak dates.",
    airportTips: [
      { label: "Delhi terminal", value: "International departures from Terminal 3 (DEL)" },
      {
        label: "Bangkok airports",
        value:
          "Suvarnabhumi (BKK) for full-service carriers; Don Mueang (DMK) for most low-cost flights",
      },
      {
        label: "Onward connections",
        value: "Bangkok connects widely to Phuket, Krabi, Vietnam and Bali",
      },
    ],
    faqs: [
      {
        question: "How long is Delhi to Bangkok?",
        answer: "Roughly 4 hours 15 minutes to 4 hours 45 minutes nonstop.",
      },
      {
        question: "Which Bangkok airport will I land at?",
        answer:
          "Suvarnabhumi (BKK) for full-service airlines and Don Mueang (DMK) for most low-cost carriers. They are about an hour apart, so check before booking a same-day onward flight.",
      },
    ],
    destinationSlug: "bangkok",
    updatedAt: "2026-09-08",
  },
  {
    from: "BOM",
    to: "SIN",
    fromCity: "Mumbai",
    toCity: "Singapore",
    fromCountry: "India",
    toCountry: "Singapore",
    distanceKm: 3910,
    nonstopDuration: "5h 15m – 5h 45m",
    airlines: ["Singapore Airlines", "IndiGo", "Air India", "Scoot"],
    intro:
      "India's most reliable link to Southeast Asia, with both a premium full-service option and low-cost capacity on the same day. Many travellers use it as the first leg to Australia or Bali, and through-fares via Singapore are frequently cheaper than booking the two legs separately.",
    cheapestTime:
      "February to April and August to September. Fares rise around Diwali, Christmas and the Chinese New Year period.",
    whenToBook:
      "Six to ten weeks out, earlier for travel across the December and Lunar New Year holidays.",
    airportTips: [
      { label: "Mumbai terminal", value: "Terminal 2 at Chhatrapati Shivaji Maharaj (BOM)" },
      {
        label: "Singapore terminals",
        value: "Changi (SIN) Terminal 3 for Singapore Airlines, Terminal 1 for Scoot and IndiGo",
      },
      {
        label: "Transit",
        value:
          "Changi is a comfortable place to break a long journey — most connections allow it without leaving airside",
      },
    ],
    faqs: [
      {
        question: "How long is Mumbai to Singapore?",
        answer: "Around 5 hours 15 minutes to 5 hours 45 minutes nonstop.",
      },
      {
        question: "Is Singapore a good stopover to Australia?",
        answer:
          "Yes — it splits the journey roughly in half and Changi has short minimum connection times, so a same-day connection is straightforward.",
      },
    ],
    destinationSlug: "singapore",
    updatedAt: "2026-09-08",
  },
  {
    from: "BLR",
    to: "DXB",
    fromCity: "Bengaluru",
    toCity: "Dubai",
    fromCountry: "India",
    toCountry: "United Arab Emirates",
    distanceKm: 2720,
    nonstopDuration: "4h – 4h 20m",
    airlines: ["Emirates", "IndiGo", "Air India Express", "Akasa Air"],
    intro:
      "South India's busiest Gulf route, carrying a mix of business travel and a large expatriate market. Capacity has grown steadily, and the presence of low-cost carriers alongside Emirates keeps the fare floor well below what the distance would suggest.",
    cheapestTime:
      "May to September, when Gulf temperatures suppress leisure travel. Expect sharp rises around Diwali, Christmas and Eid.",
    whenToBook:
      "Four to eight weeks ahead normally; two to three months for travel in the Indian festival season.",
    airportTips: [
      {
        label: "Bengaluru terminal",
        value: "International departures use Terminal 2 at Kempegowda (BLR)",
      },
      {
        label: "Dubai terminals",
        value: "Emirates from Terminal 3; low-cost carriers usually Terminal 2",
      },
      {
        label: "Alternative airports",
        value: "Sharjah (SHJ) and Abu Dhabi (AUH) are worth comparing",
      },
    ],
    faqs: [
      {
        question: "How long is Bengaluru to Dubai?",
        answer: "About 4 hours to 4 hours 20 minutes nonstop.",
      },
      {
        question: "Which is cheaper, flying to Dubai or Sharjah?",
        answer:
          "Sharjah is often cheaper and sits about an hour from central Dubai by road. Compare the total including transfer time before deciding.",
      },
    ],
    destinationSlug: "dubai",
    updatedAt: "2026-09-08",
  },
  {
    from: "DEL",
    to: "JFK",
    fromCity: "Delhi",
    toCity: "New York",
    fromCountry: "India",
    toCountry: "United States",
    distanceKm: 11760,
    nonstopDuration: "15h – 16h",
    airlines: ["Air India", "United Airlines"],
    intro:
      "One of the longest nonstop routes from India, and the flagship India–US service. Nonstop capacity is limited to a small number of daily departures, so most travellers end up comparing them against one-stop itineraries through Europe or the Gulf, which typically add four to six hours but cost meaningfully less.",
    cheapestTime:
      "February to April and September to October. Fares peak from mid-May through August and again across the December holidays.",
    whenToBook:
      "Four to six months for summer and December travel — nonstop seats are genuinely scarce on those dates.",
    airportTips: [
      { label: "Delhi terminal", value: "Terminal 3 at Indira Gandhi (DEL)" },
      {
        label: "New York airports",
        value: "JFK and Newark (EWR) both receive nonstops from Delhi",
      },
      {
        label: "One-stop routings",
        value: "Common connections are London, Frankfurt, Paris, Doha, Dubai and Abu Dhabi",
      },
    ],
    faqs: [
      {
        question: "How long is the Delhi to New York nonstop?",
        answer:
          "Between 15 and 16 hours, depending on the routing flown that day. One-stop itineraries usually total 19 to 24 hours.",
      },
      {
        question: "Is the nonstop worth the extra cost?",
        answer:
          "It saves four to eight hours door to door. Whether that is worth the premium depends on the date — the gap narrows considerably outside the summer and December peaks.",
      },
    ],
    destinationSlug: "new-york",
    updatedAt: "2026-09-08",
  },
  {
    from: "LHR",
    to: "DXB",
    fromCity: "London",
    toCity: "Dubai",
    fromCountry: "United Kingdom",
    toCountry: "United Arab Emirates",
    distanceKm: 5500,
    nonstopDuration: "6h 45m – 7h 15m",
    airlines: ["Emirates", "British Airways", "Virgin Atlantic"],
    intro:
      "A route that works as both a destination and a doorway: a large share of passengers are connecting onward to Asia, Africa or Australia. Eastbound flights are shorter than the return, and most departures are timed either as a morning arrival or a late-evening one to feed Dubai's connecting banks.",
    cheapestTime:
      "May to August, when Dubai's summer heat cuts leisure demand sharply. The December and February half-term weeks are the peak.",
    whenToBook: "Six to twelve weeks ahead outside the school holidays.",
    airportTips: [
      {
        label: "London airports",
        value:
          "Heathrow (LHR) and Gatwick (LGW) both have nonstops; Manchester and Birmingham also serve Dubai",
      },
      { label: "Dubai terminal", value: "Emirates arrivals use Terminal 3" },
      {
        label: "Connections",
        value: "Dubai connects onward to most of South Asia, East Africa and Australasia",
      },
    ],
    faqs: [
      {
        question: "How long is London to Dubai?",
        answer: "About 6 hours 45 minutes to 7 hours 15 minutes nonstop eastbound.",
      },
      {
        question: "What is the time difference?",
        answer:
          "Dubai is four hours ahead of London in winter and three hours ahead during British Summer Time.",
      },
    ],
    destinationSlug: "dubai",
    updatedAt: "2026-09-08",
  },
  {
    from: "BKK",
    to: "SIN",
    fromCity: "Bangkok",
    toCity: "Singapore",
    fromCountry: "Thailand",
    toCountry: "Singapore",
    distanceKm: 1430,
    nonstopDuration: "2h 15m – 2h 30m",
    airlines: ["Singapore Airlines", "Thai Airways", "Scoot", "Thai AirAsia", "Jetstar Asia"],
    intro:
      "Among the most heavily flown short-haul international routes in Asia, with departures roughly every hour through the day. Fares are low and stable, and the practical decision is usually which of Bangkok's two airports you leave from rather than which airline you take.",
    cheapestTime:
      "May to October, Thailand's green season. December to February is the regional high season.",
    whenToBook:
      "Two to six weeks is generally enough. This is a route where booking very early rarely pays off.",
    airportTips: [
      {
        label: "Bangkok airports",
        value:
          "Suvarnabhumi (BKK) and Don Mueang (DMK) both serve Singapore; they are about an hour apart",
      },
      { label: "Singapore terminals", value: "Changi Terminals 1 to 4 depending on carrier" },
      {
        label: "Frequency",
        value: "Departures run roughly hourly through the day across all carriers",
      },
    ],
    faqs: [
      {
        question: "How long is Bangkok to Singapore?",
        answer: "Around 2 hours 15 minutes to 2 hours 30 minutes nonstop.",
      },
      {
        question: "How often do flights go?",
        answer:
          "Roughly every hour through the day across the combined schedules of the full-service and low-cost carriers.",
      },
    ],
    destinationSlug: "singapore",
    updatedAt: "2026-09-08",
  },
  {
    from: "JFK",
    to: "LAX",
    fromCity: "New York",
    toCity: "Los Angeles",
    fromCountry: "United States",
    toCountry: "United States",
    distanceKm: 3970,
    nonstopDuration: "6h – 6h 30m westbound, 5h – 5h 30m eastbound",
    airlines: [
      "American Airlines",
      "Delta Air Lines",
      "United Airlines",
      "JetBlue",
      "Alaska Airlines",
    ],
    intro:
      "The premium transcontinental route in the United States, and the one where domestic carriers put their lie-flat business cabins. Frequency is very high in both directions, and because the route is a competitive showcase, economy fares are often lower than on shorter domestic routes.",
    cheapestTime:
      "Late January to February, and September to early November. Thanksgiving week and late December are the most expensive.",
    whenToBook:
      "Three to eight weeks ahead. Domestic US fares on high-frequency routes rarely reward booking six months out.",
    airportTips: [
      {
        label: "New York airports",
        value: "JFK, Newark (EWR) and LaGuardia (LGA) all serve Los Angeles",
      },
      {
        label: "Los Angeles alternatives",
        value:
          "Burbank (BUR), Long Beach (LGB) and Orange County (SNA) may be closer to your destination",
      },
      {
        label: "Premium cabins",
        value:
          "Several carriers operate lie-flat seats on this route, unusual for a domestic flight",
      },
    ],
    faqs: [
      {
        question: "How long is New York to Los Angeles?",
        answer:
          "About 6 to 6 and a half hours westbound. The eastbound return is roughly an hour shorter thanks to tailwinds.",
      },
      {
        question: "Which New York airport is best?",
        answer:
          "All three serve Los Angeles. JFK and Newark carry the most nonstops; LaGuardia is closest to Manhattan but has fewer transcontinental options.",
      },
    ],
    updatedAt: "2026-09-08",
  },
  {
    from: "LHR",
    to: "CDG",
    fromCity: "London",
    toCity: "Paris",
    fromCountry: "United Kingdom",
    toCountry: "France",
    distanceKm: 350,
    nonstopDuration: "1h 15m – 1h 25m",
    airlines: ["British Airways", "Air France", "easyJet", "Vueling"],
    intro:
      "A very short flight with a long journey wrapped around it: airport transfers and security usually cost more time than the flight itself. The Eurostar competes directly on city-centre-to-city-centre time, which keeps air fares low but also means the cheapest flight is not always the fastest way to Paris.",
    cheapestTime:
      "January to March and November. Fares firm up over the summer and around public holidays in both countries.",
    whenToBook: "Two to six weeks ahead. Low-cost seat sales are frequent on this route.",
    airportTips: [
      {
        label: "London airports",
        value: "Heathrow (LHR), Gatwick (LGW), Luton (LTN) and Stansted (STN) all fly to Paris",
      },
      {
        label: "Paris airports",
        value:
          "Charles de Gaulle (CDG), Orly (ORY) and Beauvais (BVA) — Beauvais is well outside the city",
      },
      {
        label: "Alternative",
        value:
          "Eurostar runs St Pancras to Gare du Nord in about 2h 20m, city centre to city centre",
      },
    ],
    faqs: [
      {
        question: "How long is London to Paris by air?",
        answer:
          "The flight itself is about 1 hour 15 minutes. Door to door is typically 4 to 5 hours.",
      },
      {
        question: "Is flying faster than the train?",
        answer:
          "Rarely, once airport transfers and security are counted. Eurostar takes about 2 hours 20 minutes between city centres.",
      },
    ],
    destinationSlug: "paris",
    updatedAt: "2026-09-08",
  },
  {
    from: "SYD",
    to: "MEL",
    fromCity: "Sydney",
    toCity: "Melbourne",
    fromCountry: "Australia",
    toCountry: "Australia",
    distanceKm: 710,
    nonstopDuration: "1h 25m – 1h 40m",
    airlines: ["Qantas", "Virgin Australia", "Jetstar", "Rex"],
    intro:
      "One of the busiest domestic air corridors in the world, with departures every twenty to thirty minutes at peak times. Fares are low and change constantly through the day, so the departure time you choose usually matters more to the price than how far ahead you book.",
    cheapestTime:
      "February to May and August to October. School holidays and the weeks around Christmas are the peak.",
    whenToBook:
      "One to four weeks. Mid-morning and early-afternoon departures are consistently cheaper than the business peaks.",
    airportTips: [
      {
        label: "Sydney terminals",
        value: "Terminal 2 for Virgin, Jetstar and Rex; Terminal 3 for Qantas",
      },
      {
        label: "Melbourne airports",
        value:
          "Tullamarine (MEL) for most flights; Avalon (AVV) is further out and used by some low-cost services",
      },
      { label: "Frequency", value: "Departures every 20 to 30 minutes at peak times" },
    ],
    faqs: [
      {
        question: "How long is Sydney to Melbourne?",
        answer: "About 1 hour 25 minutes to 1 hour 40 minutes in the air.",
      },
      {
        question: "When is the cheapest time of day to fly?",
        answer:
          "Mid-morning and early afternoon. The 06:00–09:00 and 16:00–19:00 business peaks carry the highest fares.",
      },
    ],
    updatedAt: "2026-09-08",
  },
  {
    from: "FRA",
    to: "JFK",
    fromCity: "Frankfurt",
    toCity: "New York",
    fromCountry: "Germany",
    toCountry: "United States",
    distanceKm: 6200,
    nonstopDuration: "8h 30m – 9h 15m",
    airlines: ["Lufthansa", "United Airlines", "Singapore Airlines", "Condor"],
    intro:
      "Germany's principal transatlantic route, and a genuine hub-to-hub connection: large proportions of the passengers on any given departure are connecting at one end or both. That makes fares from smaller German and central European cities to New York via Frankfurt competitive with the Frankfurt-only fare.",
    cheapestTime:
      "January to March and the first half of November. June to August and the Christmas period are the peak.",
    whenToBook: "Two to four months ahead for summer; six to eight weeks in winter.",
    airportTips: [
      {
        label: "Frankfurt terminal",
        value: "Lufthansa long-haul departs Terminal 1 at Frankfurt (FRA)",
      },
      { label: "New York airports", value: "JFK and Newark (EWR) both receive nonstops" },
      {
        label: "Connections",
        value: "Frankfurt feeds most of Germany, Austria, Switzerland and central Europe",
      },
    ],
    faqs: [
      {
        question: "How long is Frankfurt to New York?",
        answer: "Around 8 hours 30 minutes to 9 hours 15 minutes westbound nonstop.",
      },
      {
        question: "Should I book a connecting flight from my home city?",
        answer:
          "Usually yes. A through-ticket via Frankfurt is often priced at or near the Frankfurt–New York fare and protects you if the first leg is delayed.",
      },
    ],
    destinationSlug: "new-york",
    updatedAt: "2026-09-08",
  },
  {
    from: "YYZ",
    to: "LHR",
    fromCity: "Toronto",
    toCity: "London",
    fromCountry: "Canada",
    toCountry: "United Kingdom",
    distanceKm: 5700,
    nonstopDuration: "6h 45m – 7h 30m",
    airlines: ["Air Canada", "British Airways", "WestJet", "Air Transat"],
    intro:
      "Canada's busiest transatlantic route, with both legacy and leisure carriers competing. Almost every departure is an overnight, leaving Toronto in the evening and landing in London in the morning, so the practical question is which London airport you want to wake up at.",
    cheapestTime:
      "Late January to March and October to November. July, August and the Christmas weeks are the peak.",
    whenToBook: "Three to five months ahead for summer travel; eight weeks is workable in winter.",
    airportTips: [
      {
        label: "Toronto terminal",
        value: "Air Canada uses Terminal 1 at Pearson (YYZ); most others use Terminal 3",
      },
      { label: "London airports", value: "Heathrow (LHR) and Gatwick (LGW) both receive nonstops" },
      {
        label: "Schedule",
        value: "Almost all departures are overnight, arriving in London early morning",
      },
    ],
    faqs: [
      {
        question: "How long is Toronto to London?",
        answer: "Between 6 hours 45 minutes and 7 hours 30 minutes eastbound nonstop.",
      },
      {
        question: "Are the leisure carriers cheaper?",
        answer:
          "Often noticeably so, particularly outside the summer peak, but they charge separately for bags and seat selection — compare the full total.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "HKG",
    to: "LHR",
    fromCity: "Hong Kong",
    toCity: "London",
    fromCountry: "Hong Kong",
    toCountry: "United Kingdom",
    distanceKm: 9650,
    nonstopDuration: "12h 30m – 13h 30m",
    airlines: ["Cathay Pacific", "British Airways", "Virgin Atlantic"],
    intro:
      "A long-standing premium route with several daily nonstops and a heavy business-travel component. Departures from Hong Kong are mostly late evening, arriving in London the same morning, which makes the outbound an overnight and the return a full daytime flight.",
    cheapestTime:
      "Late January to March, and May to June. Fares rise around Lunar New Year, the summer and Christmas.",
    whenToBook: "Three to four months ahead for summer and holiday travel.",
    airportTips: [
      {
        label: "Hong Kong",
        value: "Hong Kong International (HKG); the Airport Express reaches Central in 24 minutes",
      },
      {
        label: "London airports",
        value: "Heathrow (LHR) receives the nonstops; Gatwick appears on some itineraries",
      },
      {
        label: "Schedule",
        value:
          "Outbound is usually an overnight; the London–Hong Kong return flies through the day",
      },
    ],
    faqs: [
      {
        question: "How long is Hong Kong to London?",
        answer:
          "Around 12 hours 30 minutes to 13 hours 30 minutes nonstop, depending on the routing flown.",
      },
      {
        question: "What is the time difference?",
        answer:
          "Hong Kong is eight hours ahead of London in winter and seven ahead during British Summer Time.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "JNB",
    to: "LHR",
    fromCity: "Johannesburg",
    toCity: "London",
    fromCountry: "South Africa",
    toCountry: "United Kingdom",
    distanceKm: 9070,
    nonstopDuration: "11h – 11h 45m",
    airlines: ["British Airways", "Virgin Atlantic", "South African Airways"],
    intro:
      "The main Africa–Europe trunk route, flown almost entirely as an overnight northbound. Because Johannesburg sits at altitude and the route runs nearly due north, there is little time-zone shift — the journey is long but the jet lag is minimal.",
    cheapestTime:
      "February to May and September to early November. December, January and the July–August European summer are the peak.",
    whenToBook:
      "Three to five months ahead for December, which is both South African summer holidays and the European festive peak.",
    airportTips: [
      {
        label: "Johannesburg",
        value: "O. R. Tambo International (JNB); the Gautrain links to Sandton in about 15 minutes",
      },
      { label: "London airports", value: "Heathrow (LHR) receives all nonstops" },
      {
        label: "Time zone",
        value: "Only one to two hours' difference, so jet lag is limited despite the length",
      },
    ],
    faqs: [
      {
        question: "How long is Johannesburg to London?",
        answer: "About 11 hours to 11 hours 45 minutes northbound nonstop.",
      },
      {
        question: "Is there much jet lag?",
        answer:
          "Very little. The route runs almost due north–south, so the time difference is only one or two hours depending on the season.",
      },
    ],
    destinationSlug: "london",
    updatedAt: "2026-09-08",
  },
  {
    from: "LAX",
    to: "HND",
    fromCity: "Los Angeles",
    toCity: "Tokyo",
    fromCountry: "United States",
    toCountry: "Japan",
    distanceKm: 8800,
    nonstopDuration: "11h 30m – 12h 30m westbound, 9h 30m – 10h 30m eastbound",
    airlines: [
      "Japan Airlines",
      "All Nippon Airways",
      "Delta Air Lines",
      "American Airlines",
      "United Airlines",
    ],
    intro:
      "The main US West Coast gateway to Japan, and a route where the arrival airport genuinely matters: Haneda is far closer to central Tokyo than Narita, and the difference is roughly an hour of ground transfer at the end of a long flight. Westbound crossings are noticeably longer than the return.",
    cheapestTime:
      "January to early March and May to June. Cherry-blossom season in late March and April, the August Obon period and the New Year weeks are the peak.",
    whenToBook:
      "Four to six months ahead for cherry-blossom season and the autumn colour weeks; two to three months otherwise.",
    airportTips: [
      {
        label: "Tokyo airports",
        value:
          "Haneda (HND) is about 30 minutes from central Tokyo; Narita (NRT) is closer to 60–90 minutes",
      },
      {
        label: "Los Angeles",
        value: "Nonstops depart from the Tom Bradley International Terminal at LAX",
      },
      {
        label: "Date line",
        value: "Westbound you lose a calendar day; eastbound you arrive the same day you left",
      },
    ],
    faqs: [
      {
        question: "How long is Los Angeles to Tokyo?",
        answer:
          "About 11 hours 30 minutes to 12 hours 30 minutes westbound. The eastbound return is roughly two hours shorter.",
      },
      {
        question: "Haneda or Narita?",
        answer:
          "Haneda if you can — it is materially closer to central Tokyo. Narita fares are sometimes lower, which can offset the longer transfer.",
      },
    ],
    destinationSlug: "tokyo",
    updatedAt: "2026-09-08",
  },
  {
    from: "SIN",
    to: "DPS",
    fromCity: "Singapore",
    toCity: "Bali",
    fromCountry: "Singapore",
    toCountry: "Indonesia",
    distanceKm: 1670,
    nonstopDuration: "2h 30m – 2h 50m",
    airlines: [
      "Singapore Airlines",
      "Scoot",
      "Garuda Indonesia",
      "Jetstar Asia",
      "Indonesia AirAsia",
    ],
    intro:
      "The most convenient way into Bali from a major international hub, and the leg most long-haul travellers use to finish the journey. Frequency is high and low-cost competition is strong, so this is usually the cheapest part of a trip to Bali from anywhere outside Southeast Asia.",
    cheapestTime:
      "February to March and October to November. July, August and the Christmas–New Year period are the peak.",
    whenToBook:
      "Three to eight weeks outside peak season; two to three months for July, August or Christmas.",
    airportTips: [
      {
        label: "Bali airport",
        value: "Ngurah Rai International (DPS), about 20 minutes from Kuta and an hour from Ubud",
      },
      { label: "Singapore terminals", value: "Changi Terminals 1 to 4 depending on carrier" },
      {
        label: "Visa",
        value:
          "Indonesia operates a visa on arrival for many nationalities — confirm before you fly",
      },
    ],
    faqs: [
      {
        question: "How long is Singapore to Bali?",
        answer: "Around 2 hours 30 minutes to 2 hours 50 minutes nonstop.",
      },
      {
        question: "Is Singapore the best connection point for Bali?",
        answer:
          "It is the highest-frequency one from Europe and India. Kuala Lumpur, Bangkok and Doha are the usual alternatives and are worth comparing on the same dates.",
      },
    ],
    destinationSlug: "bali",
    updatedAt: "2026-09-08",
  },
  {
    from: "CAI",
    to: "DXB",
    fromCity: "Cairo",
    toCity: "Dubai",
    fromCountry: "Egypt",
    toCountry: "United Arab Emirates",
    distanceKm: 2410,
    nonstopDuration: "3h 30m – 3h 50m",
    airlines: ["Emirates", "EgyptAir", "flydubai", "Air Arabia"],
    intro:
      "A dense North Africa–Gulf route carrying both business travel and a very large expatriate market, with departures spread across the day and night. Low-cost carriers operating into Sharjah and Dubai's second terminal keep the fare floor well down.",
    cheapestTime:
      "May to September. Fares climb around Eid, the Christmas period and the Egyptian school holidays.",
    whenToBook:
      "Four to eight weeks ahead; earlier around the Eid holidays, when demand is heavy in both directions.",
    airportTips: [
      { label: "Cairo terminals", value: "EgyptAir uses Terminal 3 at Cairo International (CAI)" },
      {
        label: "Dubai terminals",
        value: "Emirates from Terminal 3; flydubai from Terminal 2 and 3",
      },
      {
        label: "Alternative",
        value: "Sharjah (SHJ) is served by Air Arabia and is often the cheapest option",
      },
    ],
    faqs: [
      {
        question: "How long is Cairo to Dubai?",
        answer: "About 3 hours 30 minutes to 3 hours 50 minutes nonstop.",
      },
      {
        question: "What is the time difference?",
        answer: "Dubai is two hours ahead of Cairo for most of the year.",
      },
    ],
    destinationSlug: "dubai",
    updatedAt: "2026-09-08",
  },
  {
    from: "GRU",
    to: "LIS",
    fromCity: "São Paulo",
    toCity: "Lisbon",
    fromCountry: "Brazil",
    toCountry: "Portugal",
    distanceKm: 7940,
    nonstopDuration: "9h 30m – 10h 15m",
    airlines: ["TAP Air Portugal", "LATAM", "Azul"],
    intro:
      "South America's main gateway to Europe, and the shortest transatlantic crossing from Brazil. Lisbon works as a destination in its own right and as a connecting point onward into the rest of Europe, which is why through-fares from São Paulo to Madrid, Paris or London via Lisbon are often close to the Lisbon-only fare.",
    cheapestTime:
      "March to May and September to November. January, February, July and the Christmas weeks are the peak in one direction or the other.",
    whenToBook: "Three to five months ahead for the December–February southern summer.",
    airportTips: [
      {
        label: "São Paulo airport",
        value: "Guarulhos International (GRU) handles the international departures",
      },
      {
        label: "Lisbon",
        value:
          "Humberto Delgado (LIS) sits close to the city; the metro reaches the centre in about 20 minutes",
      },
      {
        label: "Onward",
        value: "Lisbon connects widely into Spain, France, the UK and the rest of Europe",
      },
    ],
    faqs: [
      {
        question: "How long is São Paulo to Lisbon?",
        answer: "Roughly 9 hours 30 minutes to 10 hours 15 minutes nonstop eastbound.",
      },
      {
        question: "Is Lisbon a good connection into Europe?",
        answer:
          "Yes — it is the closest European hub to Brazil, and onward fares to the rest of Europe are frequently bundled at little extra cost.",
      },
    ],
    updatedAt: "2026-09-08",
  },
];

const BY_SLUG = new Map<string, FlightRoute>();

/** `/flights/london-to-new-york` — readable, stable and keyword-shaped. */
export function routeSlug(route: Pick<FlightRoute, "fromCity" | "toCity">): string {
  return `${slugify(route.fromCity)}-to-${slugify(route.toCity)}`;
}

for (const route of FLIGHT_ROUTES) {
  BY_SLUG.set(routeSlug(route), route);
}

export function getRoute(slug: string): FlightRoute | undefined {
  return BY_SLUG.get(slug);
}

export function routeHref(route: Pick<FlightRoute, "fromCity" | "toCity">): string {
  return `/flights/${routeSlug(route)}`;
}

/** The reverse direction, when it is also a curated page. */
export function reverseRoute(route: FlightRoute): FlightRoute | undefined {
  return FLIGHT_ROUTES.find((entry) => entry.from === route.to && entry.to === route.from);
}

/** Routes arriving at, or departing from, the same city — used for internal linking. */
export function relatedRoutes(route: FlightRoute, limit = 6): FlightRoute[] {
  const slug = routeSlug(route);
  const scored = FLIGHT_ROUTES.filter((entry) => routeSlug(entry) !== slug).map((entry) => {
    let score = 3;
    if (entry.to === route.to) score = 0;
    else if (entry.from === route.from) score = 1;
    else if (entry.toCountry === route.toCountry) score = 2;
    return { entry, score };
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

export function routesToCity(airportCode: string): FlightRoute[] {
  return FLIGHT_ROUTES.filter((route) => route.to === airportCode);
}

/** The curated page for an airport pair, when there is one. */
export function curatedRoute(from: string, to: string): FlightRoute | undefined {
  return FLIGHT_ROUTES.find((route) => route.from === from && route.to === to);
}

/**
 * Shown on the homepage and at the top of the flights hub. FLIGHT_ROUTES is
 * ordered for regional spread rather than alphabetically, so taking the first
 * twelve gives a list that reads as a global product rather than one market's.
 */
export const FEATURED_ROUTES: FlightRoute[] = FLIGHT_ROUTES.slice(0, 12);
