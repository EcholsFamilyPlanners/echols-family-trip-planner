-- Travel OS Sprint 3A — Hotel & Restaurant Shortlists
-- Run in Supabase SQL Editor.

create table if not exists public.trip_hotels (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  name text not null,
  neighborhood text default '',
  price_per_night numeric default null,
  stars integer default null,
  status text default 'Considering' check (status in ('Considering','Shortlisted','Booked')),
  url text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_restaurants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  trip_id text not null,
  name text not null,
  cuisine text default '',
  price_range text default '$$' check (price_range in ('$','$$','$$$','$$$$')),
  must_try boolean default false,
  url text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_hotels enable row level security;
alter table public.trip_restaurants enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_hotels' and policyname='Household can read hotels') then
    create policy "Household can read hotels" on public.trip_hotels for select
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_hotels' and policyname='Household can insert hotels') then
    create policy "Household can insert hotels" on public.trip_hotels for insert
      with check (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_hotels' and policyname='Household can update hotels') then
    create policy "Household can update hotels" on public.trip_hotels for update
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_hotels' and policyname='Household can delete hotels') then
    create policy "Household can delete hotels" on public.trip_hotels for delete
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_restaurants' and policyname='Household can read restaurants') then
    create policy "Household can read restaurants" on public.trip_restaurants for select
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_restaurants' and policyname='Household can insert restaurants') then
    create policy "Household can insert restaurants" on public.trip_restaurants for insert
      with check (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_restaurants' and policyname='Household can update restaurants') then
    create policy "Household can update restaurants" on public.trip_restaurants for update
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trip_restaurants' and policyname='Household can delete restaurants') then
    create policy "Household can delete restaurants" on public.trip_restaurants for delete
      using (household_id = '00000000-0000-0000-0000-000000000001');
  end if;
end $$;

create index if not exists trip_hotels_trip_idx on public.trip_hotels (household_id, trip_id);
create index if not exists trip_restaurants_trip_idx on public.trip_restaurants (household_id, trip_id);
