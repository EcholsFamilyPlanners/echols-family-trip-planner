-- Travel OS — Check-in / Check-out dates on reservations
-- Run in Supabase SQL Editor.

alter table public.trip_reservations add column if not exists checkout_date date default null;

-- Rename res_date conceptually to checkin_date for hotel/car types, but keep
-- the column name as-is to avoid breaking existing data; we just add the second date.
