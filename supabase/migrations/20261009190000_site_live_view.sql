-- First-party presence for the admin live view.
-- The website server uses the service role. Visitors cannot read these tables.

create table public.site_live_sessions (
  session_key text primary key,
  path text not null default '/',
  stage text not null default 'browsing',
  country text,
  city text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint site_live_sessions_session_key_check check (char_length(session_key) between 16 and 64),
  constraint site_live_sessions_path_check check (char_length(path) between 1 and 180),
  constraint site_live_sessions_stage_check check (stage in ('browsing', 'checkout')),
  constraint site_live_sessions_country_check check (country is null or char_length(country) <= 8),
  constraint site_live_sessions_city_check check (city is null or char_length(city) <= 80)
);

create index site_live_sessions_last_seen_idx
  on public.site_live_sessions (last_seen_at desc);

create index site_live_sessions_started_idx
  on public.site_live_sessions (started_at desc);

create table public.site_live_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  detail text not null default '',
  created_at timestamptz not null default now(),
  constraint site_live_events_kind_check check (kind in ('visit', 'checkout', 'purchase')),
  constraint site_live_events_title_check check (char_length(title) between 1 and 120),
  constraint site_live_events_detail_check check (char_length(detail) <= 180)
);

create index site_live_events_created_idx
  on public.site_live_events (created_at desc);

alter table public.site_live_sessions enable row level security;
alter table public.site_live_events enable row level security;

revoke all on public.site_live_sessions from anon, authenticated;
revoke all on public.site_live_events from anon, authenticated;
