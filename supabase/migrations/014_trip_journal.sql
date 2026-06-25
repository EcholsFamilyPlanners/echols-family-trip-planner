-- Travel OS Sprint 4B — Post-Trip Journal
-- Run in Supabase SQL Editor.

create table if not exists public.trip_journal (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  entry_date date not null,
  title text default '',
  body text not null,
  rating integer default null check (rating between 1 and 5),
  authored_by uuid references auth.users(id) on delete set null,
  author_name text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_journal enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_journal' and policyname='Household can read journal') then
    create policy "Household can read journal" on public.trip_journal for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_journal' and policyname='Household can insert journal') then
    create policy "Household can insert journal" on public.trip_journal for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_journal' and policyname='Household can update journal') then
    create policy "Household can update journal" on public.trip_journal for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_journal' and policyname='Household can delete journal') then
    create policy "Household can delete journal" on public.trip_journal for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists trip_journal_trip_idx on public.trip_journal (household_id, trip_id, entry_date);
