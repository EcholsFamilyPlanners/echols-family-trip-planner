
-- Travel OS V3.2 Personal Wish Lists and Notes
-- Safe to run even if columns already exist.

alter table public.personal_trip_data
add column if not exists wish_list boolean default false,
add column if not exists wish_rank int,
add column if not exists personal_notes text,
add column if not exists dream_reason text,
add column if not exists must_do text;

-- Helpful index for wish list views
create index if not exists personal_trip_data_household_user_wishlist_idx
on public.personal_trip_data (household_id, user_id, wish_list);
