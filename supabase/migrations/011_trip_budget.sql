-- Travel OS Sprint 3B — Per-Trip Budget Tracker
-- Run in Supabase SQL Editor.

create table if not exists public.trip_budget (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null unique,
  target numeric default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_budget_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  category text not null,
  label text not null,
  estimated numeric default 0,
  actual numeric default null,
  notes text default '',
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_budget enable row level security;
alter table public.trip_budget_items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget' and policyname='Household can read budget') then
    create policy "Household can read budget" on public.trip_budget for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget' and policyname='Household can insert budget') then
    create policy "Household can insert budget" on public.trip_budget for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget' and policyname='Household can update budget') then
    create policy "Household can update budget" on public.trip_budget for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget_items' and policyname='Household can read budget items') then
    create policy "Household can read budget items" on public.trip_budget_items for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget_items' and policyname='Household can insert budget items') then
    create policy "Household can insert budget items" on public.trip_budget_items for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget_items' and policyname='Household can update budget items') then
    create policy "Household can update budget items" on public.trip_budget_items for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_budget_items' and policyname='Household can delete budget items') then
    create policy "Household can delete budget items" on public.trip_budget_items for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists trip_budget_trip_idx on public.trip_budget (household_id, trip_id);
create index if not exists trip_budget_items_trip_idx on public.trip_budget_items (household_id, trip_id);
