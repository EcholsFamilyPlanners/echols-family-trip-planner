-- Travel OS — Remove duplicate sports venues, keep the best version of each
-- Run in Supabase SQL Editor.

-- Delete duplicates keeping only the row with the best data (most recent, or most complete)
-- Strategy: for each name, keep the one with the highest quality data (has league set, non-Trip Venue type)
-- then delete all others with the same name

DELETE FROM public.sports_venues
WHERE household_id = '00000000-0000-0000-0000-000000000001'
AND id NOT IN (
  SELECT DISTINCT ON (lower(trim(name))) id
  FROM public.sports_venues
  WHERE household_id = '00000000-0000-0000-0000-000000000001'
  ORDER BY 
    lower(trim(name)),
    -- Prefer rows that have a real league (not null, not Trip Venue, not Local Sports)
    CASE WHEN league IS NOT NULL AND league != '' AND league != 'Trip Venue' AND league != 'Local Sports' THEN 0 ELSE 1 END,
    -- Prefer rows that have a real venue type
    CASE WHEN venue_type IS NOT NULL AND venue_type != '' AND venue_type != 'Trip Venue' AND venue_type != 'Experience' THEN 0 ELSE 1 END,
    -- Prefer visited ones
    CASE WHEN visited = true THEN 0 ELSE 1 END,
    -- Finally prefer most recently created
    created_at DESC
);
