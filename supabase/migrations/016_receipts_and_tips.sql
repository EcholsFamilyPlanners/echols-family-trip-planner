-- Travel OS — Receipt Scan Jobs + Tip Tracking
-- Run in Supabase SQL Editor.

-- Receipt scan job queue (same pattern as PDF import)
create table if not exists public.receipt_scan_jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  status text not null default 'pending' check (status in ('pending','processing','complete','error')),
  result jsonb default null,
  error_message text default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.receipt_scan_jobs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='receipt_scan_jobs' and policyname='Household can read receipt jobs') then
    create policy "Household can read receipt jobs" on public.receipt_scan_jobs for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='receipt_scan_jobs' and policyname='Household can insert receipt jobs') then
    create policy "Household can insert receipt jobs" on public.receipt_scan_jobs for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='receipt_scan_jobs' and policyname='Household can update receipt jobs') then
    create policy "Household can update receipt jobs" on public.receipt_scan_jobs for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists receipt_scan_jobs_trip_idx on public.receipt_scan_jobs (household_id, trip_id, created_at desc);

-- Tip tracking on hotels and restaurants
alter table public.trip_hotels add column if not exists tip numeric default null;
alter table public.trip_restaurants add column if not exists tip numeric default null;
