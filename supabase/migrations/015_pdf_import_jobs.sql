-- Travel OS — PDF Import Job Queue
-- Run in Supabase SQL Editor.
-- Allows long-running AI extraction to happen async, avoiding Netlify timeouts.

create table if not exists public.pdf_import_jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  status text not null default 'pending' check (status in ('pending','processing','complete','error')),
  result jsonb default null,
  error_message text default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pdf_import_jobs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='pdf_import_jobs' and policyname='Household can read jobs') then
    create policy "Household can read jobs" on public.pdf_import_jobs for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='pdf_import_jobs' and policyname='Household can insert jobs') then
    create policy "Household can insert jobs" on public.pdf_import_jobs for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='pdf_import_jobs' and policyname='Household can update jobs') then
    create policy "Household can update jobs" on public.pdf_import_jobs for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists pdf_import_jobs_trip_idx on public.pdf_import_jobs (household_id, trip_id, created_at desc);
