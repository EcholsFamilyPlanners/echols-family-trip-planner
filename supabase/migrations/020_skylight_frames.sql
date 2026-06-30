-- Travel OS — Skylight Frame Integration
-- Run in Supabase SQL Editor.

create table if not exists public.skylight_frames (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  name text not null,
  email text not null,
  auto_send boolean default false,
  created_at timestamptz not null default now()
);

alter table public.skylight_frames enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='skylight_frames' and policyname='Household can read frames') then
    create policy "Household can read frames" on public.skylight_frames for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='skylight_frames' and policyname='Household can insert frames') then
    create policy "Household can insert frames" on public.skylight_frames for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='skylight_frames' and policyname='Household can update frames') then
    create policy "Household can update frames" on public.skylight_frames for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='skylight_frames' and policyname='Household can delete frames') then
    create policy "Household can delete frames" on public.skylight_frames for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
