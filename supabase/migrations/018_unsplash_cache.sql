-- Travel OS — Unsplash Photo Cache
-- Run in Supabase SQL Editor.
-- Caches looked-up destination photos so we don't re-call Unsplash on every load.

create table if not exists public.destination_photo_cache (
  trip_id text primary key,
  photo_url text not null,
  credit_name text default '',
  credit_url text default '',
  cached_at timestamptz not null default now()
);

alter table public.destination_photo_cache enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='destination_photo_cache' and policyname='Anyone can read photo cache') then
    create policy "Anyone can read photo cache" on public.destination_photo_cache for select using (true); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='destination_photo_cache' and policyname='Anyone can insert photo cache') then
    create policy "Anyone can insert photo cache" on public.destination_photo_cache for insert with check (true); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='destination_photo_cache' and policyname='Anyone can update photo cache') then
    create policy "Anyone can update photo cache" on public.destination_photo_cache for update using (true); end if; end $$;
