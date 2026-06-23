
-- Anthony & Stephanie Travel Planner V2.2 Shared Sync
-- Run this in Supabase SQL Editor.

create table if not exists public.shared_trip_data (
  id uuid primary key default gen_random_uuid(),
  trip_id text unique not null,
  status text,
  favorite boolean default false,
  ideas text,
  restaurant_notes text,
  memories text,
  packing text,
  general_notes text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);

create table if not exists public.shared_custom_trips (
  id uuid primary key default gen_random_uuid(),
  trip jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.shared_trip_data enable row level security;
alter table public.shared_custom_trips enable row level security;

drop policy if exists "Shared trip data readable by authenticated users" on public.shared_trip_data;
drop policy if exists "Shared trip data editable by authenticated users" on public.shared_trip_data;
drop policy if exists "Shared custom trips readable by authenticated users" on public.shared_custom_trips;
drop policy if exists "Shared custom trips editable by authenticated users" on public.shared_custom_trips;

create policy "Shared trip data readable by authenticated users"
on public.shared_trip_data for select
to authenticated
using (true);

create policy "Shared trip data editable by authenticated users"
on public.shared_trip_data for all
to authenticated
using (true)
with check (true);

create policy "Shared custom trips readable by authenticated users"
on public.shared_custom_trips for select
to authenticated
using (true);

create policy "Shared custom trips editable by authenticated users"
on public.shared_custom_trips for all
to authenticated
using (true)
with check (true);
