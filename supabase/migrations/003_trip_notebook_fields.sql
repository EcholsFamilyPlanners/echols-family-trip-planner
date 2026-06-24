
-- Travel OS V3.1 Trip Notebook Fields
-- Safe to run even if some columns already exist.

alter table public.shared_trip_data
add column if not exists itinerary_notes text,
add column if not exists hotel_notes text,
add column if not exists flight_notes text,
add column if not exists restaurant_notes text,
add column if not exists reservation_notes text,
add column if not exists map_notes text,
add column if not exists document_notes text,
add column if not exists post_trip_summary text,
add column if not exists what_worked text,
add column if not exists what_to_change text;
