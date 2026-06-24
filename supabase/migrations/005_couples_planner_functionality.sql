
-- Travel OS V3.3 Couples Planner Functionality
-- Safe to run multiple times.

alter table public.household_members
add column if not exists nickname text;

create index if not exists household_members_household_user_idx
on public.household_members (household_id, user_id);

create index if not exists personal_trip_data_household_user_trip_idx
on public.personal_trip_data (household_id, user_id, trip_id);

create index if not exists shared_trip_data_household_status_idx
on public.shared_trip_data (household_id, status);
