-- ─────────────────────────────────────────────────────────────
-- Harvest Church of God Ethiopia — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run any time — tables use "if not exists" and every
-- policy is dropped-and-recreated so re-running never errors.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── EVENTS ──────────────────────────────────────────────────
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  event_date   date not null,
  event_time   text,                       -- e.g. "9:00 AM"
  location     text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── SERMONS ─────────────────────────────────────────────────
create table if not exists sermons (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  pastor_name  text not null,
  sermon_date  date not null,
  youtube_url  text,
  description  text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── GALLERY IMAGES ──────────────────────────────────────────
-- Files themselves live in the "gallery-images" Storage bucket;
-- this table just indexes them.
create table if not exists gallery_images (
  id            uuid primary key default gen_random_uuid(),
  album         text not null default 'General',
  caption       text,
  storage_path  text not null,             -- path inside the gallery-images bucket
  created_at    timestamptz not null default now()
);

-- ── NEWSLETTER ISSUES ───────────────────────────────────────
create table if not exists newsletter_issues (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  amharic     text,                        -- optional Amharic title
  tag         text not null default 'Church Life',
  preview     text not null,               -- shown before "Read More"
  content     text not null,               -- shown after "Read More"
  image_url   text,
  author_name text,                        -- publisher / author byline shown on the card
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Existing project? this adds the new column safely without affecting data.
alter table newsletter_issues add column if not exists author_name text;

-- ── NEWSLETTER REACTIONS (love / like / dislike) ─────────────
-- One reaction per browser per issue (client_id is a random UUID
-- the browser stores in localStorage — see components/NewsletterReactions.tsx).
create table if not exists newsletter_reactions (
  id         uuid primary key default gen_random_uuid(),
  issue_id   uuid not null references newsletter_issues(id) on delete cascade,
  client_id  text not null,
  reaction   text not null check (reaction in ('love','like','dislike')),
  created_at timestamptz not null default now(),
  unique (issue_id, client_id)
);

-- ── NEWSLETTER SUBSCRIBERS ──────────────────────────────────
create table if not exists subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  status         text not null default 'active',   -- 'active' | 'unsubscribed'
  subscribed_at  timestamptz not null default now()
);

-- ── CONTACT MESSAGES ────────────────────────────────────────
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
--
-- Admins are real Supabase Auth users (create them in the
-- Supabase dashboard: Authentication → Users → Add user — no
-- code changes needed). Every /api/admin/** route and /admin/**
-- page is gated by middleware.ts, which checks that Auth session.
--
-- All admin reads/writes then go through the SERVICE ROLE key
-- (see lib/supabase/admin.ts), which bypasses RLS entirely — so
-- the policies below only need to describe what the PUBLIC
-- (publishable/anon key) is allowed to do directly.
-- ─────────────────────────────────────────────────────────────

alter table events               enable row level security;
alter table sermons              enable row level security;
alter table gallery_images       enable row level security;
alter table newsletter_issues    enable row level security;
alter table newsletter_reactions enable row level security;
alter table subscribers          enable row level security;
alter table contact_messages     enable row level security;

drop policy if exists "published events are publicly readable" on events;
create policy "published events are publicly readable"
  on events for select using (is_published = true);

drop policy if exists "published sermons are publicly readable" on sermons;
create policy "published sermons are publicly readable"
  on sermons for select using (is_published = true);

drop policy if exists "gallery images are publicly readable" on gallery_images;
create policy "gallery images are publicly readable"
  on gallery_images for select using (true);

drop policy if exists "published newsletter issues are publicly readable" on newsletter_issues;
create policy "published newsletter issues are publicly readable"
  on newsletter_issues for select using (published = true);

drop policy if exists "reactions are publicly readable" on newsletter_reactions;
create policy "reactions are publicly readable"
  on newsletter_reactions for select using (true);

drop policy if exists "anyone can submit a contact message" on contact_messages;
create policy "anyone can submit a contact message"
  on contact_messages for insert with check (true);

drop policy if exists "anyone can subscribe to the newsletter" on subscribers;
create policy "anyone can subscribe to the newsletter"
  on subscribers for insert with check (true);

-- No public select/update/delete policies are defined for
-- contact_messages or subscribers — the only way to read or
-- change them is via the admin API (service role key).
-- Reactions are written via /api/reactions using the service
-- role key too (so one browser can only ever hold one row per
-- issue, enforced by the unique constraint above).

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for gallery photos
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

drop policy if exists "gallery images bucket is publicly readable" on storage.objects;
create policy "gallery images bucket is publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

-- Uploads/deletes to the bucket are only ever performed by the
-- admin API using the service role key, which bypasses storage
-- RLS too — no additional write policy is required here.
