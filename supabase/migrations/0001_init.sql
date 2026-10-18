-- Starloom Dream Dispatch — Supabase / PostgreSQL schema (portable reference)
-- The live preview uses Drizzle ORM against PostgreSQL with the same shape.
-- Run this in the Supabase SQL editor, or `supabase db push` with the CLI.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text not null,
  password_hash text not null,
  role text not null default 'keeper',
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  token text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  tagline text not null,
  description text not null,
  dream_type text not null default 'dream',
  accent text not null default 'pink',
  art_key text not null default 'dispatch',
  year text not null default '1996',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  summary text not null,
  accent text not null default 'lavender',
  emoji text not null default '🌙',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_pages (
  id bigint generated always as identity primary key,
  story_id bigint not null references public.stories(id) on delete cascade,
  page_number int not null,
  body text not null,
  art text not null default '✨',
  unique (story_id, page_number)
);

create table if not exists public.guestbook_entries (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 40),
  message text not null check (char_length(message) between 4 and 420),
  mood text not null default 'sleepy' check (mood in ('sleepy','sparkly','giddy','cozy','dreamy')),
  status text not null default 'approved' check (status in ('approved','pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 2 and 20),
  score int not null check (score between 0 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  source text not null default 'local',
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_preferences (
  id bigint generated always as identity primary key,
  visitor_id text unique not null,
  theme text not null default 'day' check (theme in ('day','night')),
  sound boolean not null default false,
  sparkles boolean not null default true,
  chaos boolean not null default false,
  reduce_motion boolean not null default false,
  consented_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_stats (
  key text primary key,
  value int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create index if not exists guestbook_status_idx on public.guestbook_entries (status, created_at desc);
create index if not exists scores_rank_idx on public.scores (score desc);
create index if not exists chat_visitor_idx on public.chat_messages (visitor_id, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public visitors may read published content and approved notes, and may insert
-- moderated content. Only authenticated keepers (users row with role='keeper')
-- may update or delete. The Service Role key is used only in Edge Functions and
-- must never be shipped to the browser.
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.stories enable row level security;
alter table public.story_pages enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.scores enable row level security;
alter table public.chat_messages enable row level security;
alter table public.visitor_preferences enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_stats enable row level security;
alter table public.users enable row level security;
alter table public.sessions enable row level security;

create or replace function public.is_keeper() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = 'keeper'
  );
$$;

drop policy if exists "read published projects" on public.projects;
create policy "read published projects" on public.projects
  for select using (published or public.is_keeper());

drop policy if exists "keepers write projects" on public.projects;
create policy "keepers write projects" on public.projects
  for all using (public.is_keeper()) with check (public.is_keeper());

drop policy if exists "read published stories" on public.stories;
create policy "read published stories" on public.stories
  for select using (published or public.is_keeper());

drop policy if exists "keepers write stories" on public.stories;
create policy "keepers write stories" on public.stories
  for all using (public.is_keeper()) with check (public.is_keeper());

drop policy if exists "read pages of published stories" on public.story_pages;
create policy "read pages of published stories" on public.story_pages
  for select using (
    exists (select 1 from public.stories s where s.id = story_id and (s.published or public.is_keeper()))
  );

drop policy if exists "keepers write story pages" on public.story_pages;
create policy "keepers write story pages" on public.story_pages
  for all using (public.is_keeper()) with check (public.is_keeper());

drop policy if exists "read approved guestbook" on public.guestbook_entries;
create policy "read approved guestbook" on public.guestbook_entries
  for select using (status = 'approved' or public.is_keeper());

drop policy if exists "anyone may sign guestbook" on public.guestbook_entries;
create policy "anyone may sign guestbook" on public.guestbook_entries
  for insert with check (
    char_length(name) between 2 and 40
    and char_length(message) between 4 and 420
  );

drop policy if exists "keepers moderate guestbook" on public.guestbook_entries;
create policy "keepers moderate guestbook" on public.guestbook_entries
  for update using (public.is_keeper()) with check (public.is_keeper());

drop policy if exists "keepers delete guestbook" on public.guestbook_entries;
create policy "keepers delete guestbook" on public.guestbook_entries
  for delete using (public.is_keeper());

drop policy if exists "read scores" on public.scores;
create policy "read scores" on public.scores for select using (true);

drop policy if exists "anyone may submit a score" on public.scores;
create policy "anyone may submit a score" on public.scores
  for insert with check (char_length(player_name) between 2 and 20 and score between 0 and 500);

drop policy if exists "keepers delete scores" on public.scores;
create policy "keepers delete scores" on public.scores for delete using (public.is_keeper());

-- Chat transcripts are only readable by keepers; writes happen via the Edge Function
-- with the service role after validation and rate limiting.
drop policy if exists "keepers read chat" on public.chat_messages;
create policy "keepers read chat" on public.chat_messages for select using (public.is_keeper());

drop policy if exists "keepers delete chat" on public.chat_messages;
create policy "keepers delete chat" on public.chat_messages for delete using (public.is_keeper());

drop policy if exists "read own preferences" on public.visitor_preferences;
create policy "read own preferences" on public.visitor_preferences
  for select using (true);

drop policy if exists "write own preferences" on public.visitor_preferences;
create policy "write own preferences" on public.visitor_preferences
  for insert with check (char_length(visitor_id) between 8 and 64);

drop policy if exists "update own preferences" on public.visitor_preferences;
create policy "update own preferences" on public.visitor_preferences
  for update using (char_length(visitor_id) between 8 and 64);

drop policy if exists "delete own preferences" on public.visitor_preferences;
create policy "delete own preferences" on public.visitor_preferences
  for delete using (true);

drop policy if exists "read settings" on public.site_settings;
create policy "read settings" on public.site_settings for select using (true);

drop policy if exists "keepers write settings" on public.site_settings;
create policy "keepers write settings" on public.site_settings
  for all using (public.is_keeper()) with check (public.is_keeper());

drop policy if exists "read stats" on public.site_stats;
create policy "read stats" on public.site_stats for select using (true);

drop policy if exists "keepers write stats" on public.site_stats;
create policy "keepers write stats" on public.site_stats
  for all using (public.is_keeper()) with check (public.is_keeper());

-- users/sessions: no public access at all (server / service role only).
