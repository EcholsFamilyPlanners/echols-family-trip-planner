-- Travel OS — Pre-seed NASCAR tracks + Indianapolis Motor Speedway
-- Run in Supabase SQL Editor.
-- Uses INSERT ... ON CONFLICT DO NOTHING so safe to run multiple times.

insert into public.sports_venues (household_id, name, city, state_region, country, venue_type, league, notes, visited)
values
  ('00000000-0000-0000-0000-000000000001', 'Daytona International Speedway', 'Daytona Beach', 'Florida', 'United States', 'Racetrack', 'NASCAR', 'Home of the Daytona 500', false),
  ('00000000-0000-0000-0000-000000000001', 'Talladega Superspeedway', 'Talladega', 'Alabama', 'United States', 'Racetrack', 'NASCAR', 'Longest track on the NASCAR circuit', false),
  ('00000000-0000-0000-0000-000000000001', 'Charlotte Motor Speedway', 'Concord', 'North Carolina', 'United States', 'Racetrack', 'NASCAR', 'Home of the Coca-Cola 600', false),
  ('00000000-0000-0000-0000-000000000001', 'Bristol Motor Speedway', 'Bristol', 'Tennessee', 'United States', 'Racetrack', 'NASCAR', 'The Last Great Colosseum', false),
  ('00000000-0000-0000-0000-000000000001', 'Martinsville Speedway', 'Ridgeway', 'Virginia', 'United States', 'Racetrack', 'NASCAR', 'Oldest track on the NASCAR circuit', false),
  ('00000000-0000-0000-0000-000000000001', 'Dover Motor Speedway', 'Dover', 'Delaware', 'United States', 'Racetrack', 'NASCAR', 'The Monster Mile', false),
  ('00000000-0000-0000-0000-000000000001', 'Michigan International Speedway', 'Brooklyn', 'Michigan', 'United States', 'Racetrack', 'NASCAR', 'Two miles of wide-open racing', false),
  ('00000000-0000-0000-0000-000000000001', 'Pocono Raceway', 'Long Pond', 'Pennsylvania', 'United States', 'Racetrack', 'NASCAR', 'The Tricky Triangle', false),
  ('00000000-0000-0000-0000-000000000001', 'Atlanta Motor Speedway', 'Hampton', 'Georgia', 'United States', 'Racetrack', 'NASCAR', 'High-speed superspeedway near Atlanta', false),
  ('00000000-0000-0000-0000-000000000001', 'Texas Motor Speedway', 'Fort Worth', 'Texas', 'United States', 'Racetrack', 'NASCAR', 'Fort Worth area superspeedway', false),
  ('00000000-0000-0000-0000-000000000001', 'Kansas Speedway', 'Kansas City', 'Kansas', 'United States', 'Racetrack', 'NASCAR', 'D-shaped oval in Kansas City area', false),
  ('00000000-0000-0000-0000-000000000001', 'Las Vegas Motor Speedway', 'Las Vegas', 'Nevada', 'United States', 'Racetrack', 'NASCAR', 'One and a half mile oval in Las Vegas', false),
  ('00000000-0000-0000-0000-000000000001', 'Phoenix Raceway', 'Avondale', 'Arizona', 'United States', 'Racetrack', 'NASCAR', 'Home of the Championship race', false),
  ('00000000-0000-0000-0000-000000000001', 'Homestead-Miami Speedway', 'Homestead', 'Florida', 'United States', 'Racetrack', 'NASCAR', 'South Florida superspeedway', false),
  ('00000000-0000-0000-0000-000000000001', 'Watkins Glen International', 'Watkins Glen', 'New York', 'United States', 'Racetrack', 'NASCAR', 'Historic road course in the Finger Lakes', false),
  ('00000000-0000-0000-0000-000000000001', 'Sonoma Raceway', 'Sonoma', 'California', 'United States', 'Racetrack', 'NASCAR', 'Wine country road course', false),
  ('00000000-0000-0000-0000-000000000001', 'New Hampshire Motor Speedway', 'Loudon', 'New Hampshire', 'United States', 'Racetrack', 'NASCAR', 'Magic Mile in New England', false),
  ('00000000-0000-0000-0000-000000000001', 'Richmond Raceway', 'Richmond', 'Virginia', 'United States', 'Racetrack', 'NASCAR', 'Three-quarter mile D-shaped oval', false),
  ('00000000-0000-0000-0000-000000000001', 'Auto Club Speedway', 'Fontana', 'California', 'United States', 'Racetrack', 'NASCAR', 'Two-mile oval near Los Angeles', false),
  ('00000000-0000-0000-0000-000000000001', 'Nashville Superspeedway', 'Lebanon', 'Tennessee', 'United States', 'Racetrack', 'NASCAR', 'Concrete oval near Nashville', false),
  ('00000000-0000-0000-0000-000000000001', 'Circuit of the Americas', 'Austin', 'Texas', 'United States', 'Racetrack', 'NASCAR', 'F1 road course hosting NASCAR', false),
  ('00000000-0000-0000-0000-000000000001', 'Indianapolis Motor Speedway', 'Indianapolis', 'Indiana', 'United States', 'Racetrack', 'IndyCar / NASCAR', 'The Brickyard — home of the Indy 500 and Brickyard 400', false)
on conflict do nothing;
