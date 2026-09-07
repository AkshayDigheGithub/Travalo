-- Tripora schema. Everything here is optional: the app runs without a database.
-- There are deliberately no user/account tables — the MVP has no authentication.

create table if not exists destinations (
  slug              text primary key,
  name              text not null,
  country           text not null,
  country_code      text not null,
  city_code         text,
  airport_code      text,
  hero_image_url    text,
  intro             text,
  best_time_to_visit text,
  currency          text,
  timezone          text,
  is_featured       boolean not null default false,
  sort_order        integer not null default 100,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists popular_routes (
  id             bigserial primary key,
  origin_code    text not null,
  destination_code text not null,
  origin_label   text not null,
  destination_label text not null,
  sort_order     integer not null default 100,
  unique (origin_code, destination_code)
);

create table if not exists popular_hotels (
  id               bigserial primary key,
  destination_slug text not null references destinations (slug) on delete cascade,
  provider_hotel_id text not null,
  name             text not null,
  sort_order       integer not null default 100,
  unique (destination_slug, provider_hotel_id)
);

-- One row per search submitted. Anonymous: no IP, no user identifier.
create table if not exists searches (
  id           uuid primary key,
  kind         text not null check (kind in ('flight', 'hotel')),
  origin       text,
  destination  text,
  depart_date  date,
  return_date  date,
  travellers   integer,
  currency     text,
  result_count integer,
  is_mock      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists searches_created_at_idx on searches (created_at desc);
create index if not exists searches_kind_idx on searches (kind, created_at desc);

-- Recorded immediately before a user is redirected to a partner.
create table if not exists affiliate_clicks (
  id          uuid primary key,
  kind        text not null check (kind in ('flight', 'hotel')),
  provider    text not null,
  destination text,
  search_id   uuid,
  result_id   text,
  sub_id      text,
  currency    text,
  price       numeric(12, 2),
  created_at  timestamptz not null default now()
);

create index if not exists affiliate_clicks_created_at_idx on affiliate_clicks (created_at desc);
create index if not exists affiliate_clicks_search_idx on affiliate_clicks (search_id);

-- Anonymous product analytics (flight_search, filter_used, affiliate_click, …).
create table if not exists analytics_events (
  id          bigserial primary key,
  name        text not null,
  anonymous_id text,
  properties  jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_name_idx on analytics_events (name, created_at desc);

-- Runtime configuration that shouldn't require a redeploy.
create table if not exists app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
