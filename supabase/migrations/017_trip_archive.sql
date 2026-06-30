-- Travel OS — Trip Archive (Hide built-in trips)
-- Run in Supabase SQL Editor.

create table if not exists public.archived_trips (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null unique,
  archived_at timestamptz not null default now()
);

alter table public.archived_trips enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='archived_trips' and policyname='Household can read archived') then
    create policy "Household can read archived" on public.archived_trips for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='archived_trips' and policyname='Household can insert archived') then
    create policy "Household can insert archived" on public.archived_trips for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='archived_trips' and policyname='Household can delete archived') then
    create policy "Household can delete archived" on public.archived_trips for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists archived_trips_idx on public.archived_trips (household_id, trip_id);
