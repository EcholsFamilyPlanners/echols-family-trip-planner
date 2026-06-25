-- Travel OS Sprint 3C — Reservations Tracker
-- Run in Supabase SQL Editor.

create table if not exists public.trip_reservations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  name text not null,
  res_type text default 'Other' check (res_type in ('Flight','Hotel','Restaurant','Activity','Car','Other')),
  confirmation text default '',
  res_date date default null,
  cost numeric default null,
  status text default 'Pending' check (status in ('Pending','Confirmed','Cancelled')),
  url text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_reservations enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_reservations' and policyname='Household can read reservations') then
    create policy "Household can read reservations" on public.trip_reservations for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_reservations' and policyname='Household can insert reservations') then
    create policy "Household can insert reservations" on public.trip_reservations for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_reservations' and policyname='Household can update reservations') then
    create policy "Household can update reservations" on public.trip_reservations for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_reservations' and policyname='Household can delete reservations') then
    create policy "Household can delete reservations" on public.trip_reservations for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists trip_reservations_trip_idx on public.trip_reservations (household_id, trip_id, res_date);
