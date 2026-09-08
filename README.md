# bookmyflight.lol

A global flight and hotel metasearch, built with Next.js and designed to run on
Vercel. Search flights and hotels worldwide, compare and filter the results,
then continue to a Travelpayouts partner to book.

There is no account, no login and no payment on this site — by design. The
product's job is **search → compare → discover → hand off to the provider**.

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

No credentials are needed to run the app: with `TRAVELPAYOUTS_API_TOKEN` unset,
it starts in mock mode and serves realistic sample data through the same code
paths production uses.

### Scripts

| Script                 | What it does               |
| ---------------------- | -------------------------- |
| `npm run dev`          | Development server         |
| `npm run build`        | Production build           |
| `npm run start`        | Serve the production build |
| `npm run lint`         | ESLint                     |
| `npm run typecheck`    | TypeScript, no emit        |
| `npm run format`       | Prettier (writes)          |
| `npm run format:check` | Prettier (checks only)     |

---

## Environment variables

Every variable is documented inline in [`.env.example`](./.env.example). The
short version:

| Variable                       | Required | Purpose                                                            |
| ------------------------------ | -------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`         | Rec.     | Canonical URLs, Open Graph tags, `robots.txt`, `sitemap.xml`       |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | No       | Currency shown before the visitor picks one (default `INR`)        |
| `TRAVELPAYOUTS_API_TOKEN`      | Prod     | Travelpayouts API token — **server only**                          |
| `TRAVELPAYOUTS_MARKER`         | Prod     | Affiliate marker used to attribute clicks — **server only**        |
| `TRAVELPAYOUTS_MARKET`         | No       | Market code passed to the flight price endpoint                    |
| `TRAVELPAYOUTS_MOCK`           | No       | `true` serves sample data; defaults to `true` when no token is set |
| `TRAVELPAYOUTS_MOCK_SCENARIO`  | No       | `normal` \| `empty` \| `error` \| `slow` — exercises the UI states |
| `PROVIDER_TIMEOUT_MS`          | No       | Provider request timeout (default `10000`)                         |
| `AFFILIATE_LINK_SECRET`        | Prod     | HMAC secret for signing outbound links                             |
| `DATABASE_URL`                 | No       | PostgreSQL/Supabase — destinations, analytics, click tracking      |
| `ANALYTICS_ENABLED`            | No       | Set `false` to disable analytics writes                            |
| `UPSTASH_REDIS_REST_URL`       | No       | Upstash Redis REST URL — caching and rate limiting                 |
| `UPSTASH_REDIS_REST_TOKEN`     | No       | Upstash Redis REST token                                           |
| `EXCHANGE_RATES_API_URL`       | No       | Real exchange-rate source; without it we never convert a price     |

`NEXT_PUBLIC_SITE_URL` is recommended rather than required: when it isn't set,
the site origin falls back to the URL Vercel injects
(`VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`), so a deployment still
emits correct absolute URLs instead of pointing at localhost. Set it explicitly
once you have a custom domain.

**Only `NEXT_PUBLIC_*` variables reach the browser.** Travelpayouts credentials
are read exclusively through `src/config/env.ts`, which is `server-only` — there
is no `NEXT_PUBLIC_TRAVELPAYOUTS_*` variable anywhere in this project, and every
provider request is made from the server.

---

## Mock mode

```bash
TRAVELPAYOUTS_MOCK=true
```

Mock mode is the default when no API token is configured. It serves sample
flights and hotels through the same provider interface the real integration
implements, so the entire UI — search, results, filters, sorting, details pages,
the affiliate handoff — works before you have credentials.

It deliberately behaves like a real network dependency:

- simulated latency, so loading states are real
- `TRAVELPAYOUTS_MOCK_SCENARIO=empty` returns no results
- `TRAVELPAYOUTS_MOCK_SCENARIO=error` fails, exercising the error states
- `TRAVELPAYOUTS_MOCK_SCENARIO=slow` adds a multi-second delay

Every mock result is flagged `isMock`, and the UI renders a **"Sample data"**
notice above results and a badge on each card. Sample prices are never presented
as live availability.

Production sets `TRAVELPAYOUTS_MOCK=false` and supplies real credentials.

---

## Travelpayouts setup

1. Create a Travelpayouts account and join the flight and hotel programs.
2. Copy your **API token** into `TRAVELPAYOUTS_API_TOKEN`.
3. Copy your **marker** into `TRAVELPAYOUTS_MARKER`.
4. Set `TRAVELPAYOUTS_MOCK=false`.

The integration lives in `src/lib/travelpayouts/` and uses these endpoints:

| Concern            | Endpoint                                                  |
| ------------------ | --------------------------------------------------------- |
| Flight fares       | `GET api.travelpayouts.com/aviasales/v3/prices_for_dates` |
| Airline directory  | `GET api.travelpayouts.com/data/en-airlines.json`         |
| Place autocomplete | `GET autocomplete.travelpayouts.com/places2`              |
| Hotel prices       | `GET engine.hotellook.com/api/v2/cache.json`              |
| Hotel/city lookup  | `GET engine.hotellook.com/api/v2/lookup.json`             |

Before going live, check each of these against the current Travelpayouts
documentation for your account — programs and available endpoints differ between
accounts, and `src/lib/travelpayouts/` is the only place you need to change.

### Things the integration is deliberately honest about

- **The fare endpoint returns cached prices, not a live availability search.**
  Results are presented as indicative, and the partner page is the source of
  truth. The UI says so on every results page.
- **The fare endpoint has no cabin-class parameter.** Selecting Business doesn't
  silently reprice economy fares: the choice is carried into the partner link and
  the results page states that cabin availability is confirmed there.
- **The hotel cache endpoint publishes price, stars and location only.** Guest
  scores, amenities and cancellation terms are left `undefined` rather than
  invented, and filters that would have no data to act on are hidden.
- **Currency conversion never happens without a real rate.** If
  `EXCHANGE_RATES_API_URL` is unset or unreachable, prices stay in the currency
  the provider quoted. A converted figure is always labelled `Estimated`.

### Affiliate links and click tracking

Outbound links are **signed**, not passed through. The server builds a partner
URL, checks it against a host allowlist, then HMAC-signs it into
`/go?d=<payload>&s=<signature>`. The `/go` handler verifies the signature,
re-checks the host, records the click, and only then issues the redirect.

A forged, tampered or expired link never redirects anywhere — it lands back on
`/deals`. That is what keeps the affiliate exit from becoming an open redirect.
Sub-ids follow the program's `marker=<marker>.<sub_id>` convention, e.g.
`flight_BOM_DXB_20261018`.

---

## Database setup (optional)

Search works with no database at all. Adding one enables destination content,
search analytics and affiliate click tracking. Every query is wrapped so a
missing or unhealthy database degrades silently instead of breaking a search.

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Project settings → Database → Connection string → URI.** Use the **pooled**
   connection (port `6543`) — serverless functions open many short-lived
   connections.
3. Set it as `DATABASE_URL`.
4. Run the schema in the Supabase SQL editor:

   ```bash
   cat src/lib/db/schema.sql
   ```

The schema has six tables — `destinations`, `popular_routes`, `popular_hotels`,
`searches`, `affiliate_clicks`, `analytics_events`, `app_settings` — and
deliberately **no user table**, because the MVP has no authentication.

### Redis (optional)

Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to use
[Upstash](https://upstash.com) for response caching and rate limiting. Without
them, a small per-instance in-memory cache is used instead — good enough for the
MVP, and Redis never becomes a setup requirement.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository. The framework is
   detected automatically; no build settings need changing.
3. Add your environment variables under **Settings → Environment Variables**.
   At minimum: `NEXT_PUBLIC_SITE_URL`, `TRAVELPAYOUTS_API_TOKEN`,
   `TRAVELPAYOUTS_MARKER`, `AFFILIATE_LINK_SECRET`, and
   `TRAVELPAYOUTS_MOCK=false`.
4. Deploy.

No `vercel.json` is needed — the defaults are correct for this project. There is
no VPS, no PM2, no Nginx, no Docker and no long-running process: the app is
Server Components, Route Handlers and static pages. Nothing writes to the local
filesystem.

---

## Architecture

```
src/
  app/                      routes, route handlers, sitemap, robots
    api/                    /api/flights/*, /api/hotels/*, /api/analytics
    go/                     signed affiliate redirect
  components/
    ui/                     shadcn-style primitives on Radix
    layout/                 header, footer, navigation
    common/                 cards, states, skeletons, filter shell
  features/
    flights/                search form, card, filters, results, filter logic
    hotels/                 search form, card, filters, results, details gallery
    search/                 autocomplete, date picker, travellers, tabs
    destinations/           destination card
  lib/
    travelpayouts/          the live provider: client, flights, hotels, links
    providers/              provider interface + mock implementation
    currency/               formatting and real rate conversion
    analytics/              anonymous event architecture
    validation/             Zod schemas for every input
    affiliate/              outbound link signing and verification
    db/                     optional Postgres + schema.sql
    seo/                    shared page metadata and JSON-LD builders
    utils/                  dates, slugs, URL search state
  config/                   site, currencies, airports, airlines, destinations,
                            flight routes
  hooks/                    currency, media query, debounce
  types/                    normalized domain types
```

### Design decisions worth knowing

**One provider seam.** `TravelProvider` in `src/lib/providers/types.ts` is the
only interface the app knows. The mock and Travelpayouts implementations both
satisfy it, and provider payload shapes never escape `src/lib/travelpayouts/`.

**URL is the source of truth for a search.** `src/lib/utils/search-params.ts`
owns the query-string contract, so every results page can be refreshed, shared
or reached with the back button and reproduce the same search.

**Filtering never refetches.** A search hits the API once; filters and sorting
are pure functions over the result set (`features/*/filtering.ts`), so a
checkbox is instant and costs no provider quota.

**Dates are calendar dates, not instants.** Everything internal is `YYYY-MM-DD`,
and `src/lib/utils/date.ts` only ever builds `Date` objects at UTC midnight, so
a browser in UTC−07:00 can't shift a departure by a day.

**Errors are translated once.** Providers throw `AppError`; route handlers turn
that into a sanitized response. Technical detail goes to the server log, never
to the browser.

### SEO

Editorial pages (home, `/flights`, `/flights/*`, `/hotels`, `/destinations/*`,
`/deals`, legal) are statically rendered and indexable. `src/lib/seo/metadata.ts`
builds their metadata so every one carries the same complete set — canonical,
`hreflang` (`en` + `x-default`), Open Graph, a Twitter card and a social image —
and `src/lib/seo/schema.ts` builds the JSON-LD (`Organization` and `WebSite`
once per page from the root layout, then `BreadcrumbList`, `FAQPage`,
`TouristDestination` per page, sharing one `@id` per entity so the brand
resolves as a single entity across the site).

**Route pages** (`/flights/london-to-new-york`) target the largest query family
in travel. They are curated in `src/config/routes.ts` and `dynamicParams` is
`false`, so the indexable surface can never drift past what is written by hand —
109 airports would otherwise permit ~11,700 near-duplicate permutations, which is
the thin content search engines demote. Each has its own Open Graph card
rendered at build time.

Everything on the site renders on the server. That is a constraint worth
protecting: `useSearchParams()` in a client component opts its whole Suspense
subtree out of static rendering, and because the currency provider wraps the
entire app, one such call there previously left every page's HTML empty for any
crawler that doesn't execute JavaScript. `src/hooks/use-currency.tsx` reads
`window.location.search` inside its event handler instead.

Dynamic search-result pages, hotel detail pages and `/go` are `noindex`, set
both in metadata and as an `X-Robots-Tag` header in `next.config.ts`. Only
`/api/`, `/go` and the two results routes are disallowed in `robots.ts` —
a page blocked there is a page whose `noindex` is never read.

---

## Accessibility

The autocomplete implements the WAI-ARIA combobox pattern (arrow keys, `Enter`,
`Escape`, `aria-activedescendant`). Dialogs and sheets are Radix primitives, so
focus is trapped and restored. There is a skip link, visible focus rings
throughout, labelled form controls, `aria-live` result counts, and no control
that communicates meaning through an icon alone.

## Licence and scope

This is an MVP. It does not process bookings, take payment, issue tickets or
store personal data, and `/privacy` and `/terms` contain placeholder content
that is clearly marked as pending legal review.
