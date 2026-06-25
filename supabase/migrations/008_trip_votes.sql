-- Travel OS V4.1 Trip Votes
-- Run this in Supabase SQL Editor.

create table if not exists public.trip_votes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id text not null,
  vote text not null check (vote in ('love','like','maybe','pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, user_id, trip_id)
);

alter table public.trip_votes enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'trip_votes' and policyname = 'Household members can read votes'
  ) then
    create policy "Household members can read votes"
      on public.trip_votes for select
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'trip_votes' and policyname = 'Users can upsert their own votes'
  ) then
    create policy "Users can upsert their own votes"
      on public.trip_votes for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'trip_votes' and policyname = 'Users can update their own votes'
  ) then
    create policy "Users can update their own votes"
      on public.trip_votes for update
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists trip_votes_household_trip_idx
  on public.trip_votes (household_id, trip_id);

create index if not exists trip_votes_user_idx
  on public.trip_votes (user_id);
