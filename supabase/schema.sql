-- Run this once in your Supabase project's SQL Editor (Supabase Dashboard -> SQL Editor -> New query).
-- It creates the three tables the app needs and a private storage bucket for photos/videos.

create extension if not exists "pgcrypto";

-- Shared media (photos & videos)
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- Weekly shared timetable
create table if not exists timetable_entries (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = Monday
  start_time time not null,
  end_time time not null,
  title text not null,
  owner text not null default 'both', -- 'both' or a partner's name
  color text not null default 'gold',
  created_at timestamptz not null default now()
);

-- Personal diary, private by default; an entry can be marked shared so the
-- other partner can read it too.
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  title text,
  content text not null,
  mood text,
  is_shared boolean not null default false,
  created_at timestamptz not null default now()
);

-- Row Level Security is enabled but no policies are added on purpose: the app
-- never talks to Supabase from the browser, only from server code using the
-- service role key, which bypasses RLS. This keeps everything private even if
-- your anon key ever leaked.
alter table media enable row level security;
alter table timetable_entries enable row level security;
alter table diary_entries enable row level security;

-- Private storage bucket for uploaded photos & videos.
insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;
