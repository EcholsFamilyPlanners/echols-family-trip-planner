-- Travel OS Sprint 4A — Trip Photos
-- Run in Supabase SQL Editor.

create table if not exists public.trip_photos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  storage_path text not null,
  url text not null,
  caption text default '',
  is_cover boolean default false,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.trip_photos enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_photos' and policyname='Household can read photos') then
    create policy "Household can read photos" on public.trip_photos for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_photos' and policyname='Household can insert photos') then
    create policy "Household can insert photos" on public.trip_photos for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_photos' and policyname='Household can update photos') then
    create policy "Household can update photos" on public.trip_photos for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_photos' and policyname='Household can delete photos') then
    create policy "Household can delete photos" on public.trip_photos for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists trip_photos_trip_idx on public.trip_photos (household_id, trip_id);
