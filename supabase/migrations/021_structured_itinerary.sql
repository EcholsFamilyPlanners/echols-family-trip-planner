-- Travel OS — Structured Itinerary Builder
-- Run in Supabase SQL Editor.

create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  day_number integer not null,
  day_date date default null,
  title text default '',
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  unique(household_id, trip_id, day_number)
);

create table if not exists public.itinerary_stops (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  day_id uuid not null references public.itinerary_days(id) on delete cascade,
  trip_id text not null,
  destination text not null,
  category text default 'Sightseeing' check (category in ('Sightseeing','Food','Activity','Transport','Rest')),
  time_slot text default '',
  duration_minutes integer default null,
  cost numeric default null,
  reservation_link text default '',
  website text default '',
  notes text default '',
  status text default 'Idea' check (status in ('Idea','Booked','Confirmed')),
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.itinerary_days enable row level security;
alter table public.itinerary_stops enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_days' and policyname='Household can read days') then
    create policy "Household can read days" on public.itinerary_days for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_days' and policyname='Household can insert days') then
    create policy "Household can insert days" on public.itinerary_days for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_days' and policyname='Household can update days') then
    create policy "Household can update days" on public.itinerary_days for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_days' and policyname='Household can delete days') then
    create policy "Household can delete days" on public.itinerary_days for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_stops' and policyname='Household can read stops') then
    create policy "Household can read stops" on public.itinerary_stops for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_stops' and policyname='Household can insert stops') then
    create policy "Household can insert stops" on public.itinerary_stops for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_stops' and policyname='Household can update stops') then
    create policy "Household can update stops" on public.itinerary_stops for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='itinerary_stops' and policyname='Household can delete stops') then
    create policy "Household can delete stops" on public.itinerary_stops for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists itinerary_days_trip_idx on public.itinerary_days (household_id, trip_id, day_number);
create index if not exists itinerary_stops_day_idx on public.itinerary_stops (day_id, sort_order);
create index if not exists itinerary_stops_trip_idx on public.itinerary_stops (household_id, trip_id);
