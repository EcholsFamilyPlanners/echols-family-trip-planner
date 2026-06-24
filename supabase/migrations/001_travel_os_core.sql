
-- Travel OS V3 Core Database
-- Run this whole file once in Supabase SQL Editor.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Anthony & Stephanie',
  created_at timestamptz default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text default 'member',
  created_at timestamptz default now(),
  unique(household_id, user_id)
);

create table if not exists public.shared_trip_data (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  trip_id text not null,
  status text default 'Idea',
  shared_notes text,
  ideas text,
  restaurant_notes text,
  memories text,
  packing text,
  budget_notes text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now(),
  unique(household_id, trip_id)
);

create table if not exists public.personal_trip_data (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  trip_id text not null,
  favorite boolean default false,
  want_to_visit boolean default false,
  personal_rating int,
  personal_notes text,
  updated_at timestamptz default now(),
  unique(household_id, user_id, trip_id)
);

create table if not exists public.custom_trips_v3 (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  trip jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.packing_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  name text not null,
  travel_type text default 'general',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.packing_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  template_id uuid references public.packing_templates(id) on delete cascade,
  trip_id text,
  category text default 'General',
  item text not null,
  packed boolean default false,
  sort_order int default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);

create table if not exists public.sports_venues (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  name text not null,
  city text,
  state_region text,
  country text default 'United States',
  venue_type text default 'Stadium',
  league text,
  associated_trip_id text,
  notes text,
  visited boolean default false,
  visited_date date,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trip_journal_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  trip_id text not null,
  title text,
  body text,
  rating int,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.shared_trip_data enable row level security;
alter table public.personal_trip_data enable row level security;
alter table public.custom_trips_v3 enable row level security;
alter table public.packing_templates enable row level security;
alter table public.packing_items enable row level security;
alter table public.sports_venues enable row level security;
alter table public.trip_journal_entries enable row level security;

-- Simple authenticated household policies for this family app.
-- V3.1 can tighten these into invite-only household membership.
drop policy if exists "households authenticated access" on public.households;
create policy "households authenticated access" on public.households for all to authenticated using (true) with check (true);

drop policy if exists "members authenticated access" on public.household_members;
create policy "members authenticated access" on public.household_members for all to authenticated using (true) with check (true);

drop policy if exists "shared trips authenticated access" on public.shared_trip_data;
create policy "shared trips authenticated access" on public.shared_trip_data for all to authenticated using (true) with check (true);

drop policy if exists "personal trips authenticated access" on public.personal_trip_data;
create policy "personal trips authenticated access" on public.personal_trip_data for all to authenticated using (true) with check (true);

drop policy if exists "custom trips authenticated access" on public.custom_trips_v3;
create policy "custom trips authenticated access" on public.custom_trips_v3 for all to authenticated using (true) with check (true);

drop policy if exists "packing templates authenticated access" on public.packing_templates;
create policy "packing templates authenticated access" on public.packing_templates for all to authenticated using (true) with check (true);

drop policy if exists "packing items authenticated access" on public.packing_items;
create policy "packing items authenticated access" on public.packing_items for all to authenticated using (true) with check (true);

drop policy if exists "sports venues authenticated access" on public.sports_venues;
create policy "sports venues authenticated access" on public.sports_venues for all to authenticated using (true) with check (true);

drop policy if exists "journal authenticated access" on public.trip_journal_entries;
create policy "journal authenticated access" on public.trip_journal_entries for all to authenticated using (true) with check (true);

-- Create default household
insert into public.households (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Anthony & Stephanie')
on conflict (id) do nothing;
