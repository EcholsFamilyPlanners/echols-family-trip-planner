-- Travel OS V4.3 Activity Feed
-- Run this in Supabase SQL Editor.

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  user_id uuid references auth.users(id) on delete set null,
  actor_name text not null default 'Someone',
  action_type text not null, -- 'vote', 'wish_list', 'status', 'note', 'together_note'
  trip_id text,
  trip_title text,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.activity_feed enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'activity_feed' and policyname = 'Household members can read activity'
  ) then
    create policy "Household members can read activity"
      on public.activity_feed for select
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'activity_feed' and policyname = 'Users can insert activity'
  ) then
    create policy "Users can insert activity"
      on public.activity_feed for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists activity_feed_household_idx
  on public.activity_feed (household_id, created_at desc);
