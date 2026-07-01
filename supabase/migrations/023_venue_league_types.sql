-- Travel OS — Assign proper leagues and types to seeded Trip Venues
-- Run in Supabase SQL Editor.

-- NHL
update public.sports_venues set league='NHL', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Videotron Centre','Scotiabank Saddledome','Rogers Arena','Scotiabank Arena','Scotiabank Centre','Bridgestone Arena','United Center','Ball Arena','Climate Pledge Arena','Kaseya Center','Smoothie King Center','Toyota Center','Chase Center','American Airlines Center');

-- NFL
update public.sports_venues set league='NFL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('BC Place','Gillette Stadium','MetLife Stadium','Hard Rock Stadium','Nissan Stadium','Caesars Superdome','NRG Stadium','Soldier Field','Empower Field at Mile High','Lumen Field','Sun Bowl Stadium','AT&T Stadium','Mercedes-Benz Stadium','State Farm Stadium','Cotton Bowl Stadium');

-- MLB
update public.sports_venues set league='MLB', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Rogers Centre','Fenway Park','Wrigley Field','Guaranteed Rate Field','Coors Field','Petco Park','Oracle Park','T-Mobile Park','loanDepot park','Minute Maid Park','Yankee Stadium','Citi Field','Dodger Stadium','Chase Field','Truist Park','Globe Life Field','Koshien Stadium','Meiji Jingu Stadium','Sydney Cricket Ground','First Horizon Park','Scottsdale Stadium','Salt River Fields');

-- NBA
update public.sports_venues set league='NBA', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name in ('TD Garden','Madison Square Garden','Barclays Center','Toyota Center','United Center','Ball Arena','Chase Center','Footprint Center','State Farm Arena','American Airlines Center','Delta Center','Viejas Arena');

-- MLS
update public.sports_venues set league='MLS', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('BMO Field','Shell Energy Stadium','Snapdragon Stadium','Toyota Stadium in Frisco','Toyota Field in Madison/Huntsville');

-- PGA / Golf
update public.sports_venues set league='PGA', venue_type='Golf Course' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Augusta National Golf Club','St Andrews Links','TPC Scottsdale','Sony Open golf');

-- NCAA Football — with school names
update public.sports_venues set league='NCAA FB · Harvard', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Harvard Stadium';
update public.sports_venues set league='NCAA FB · Vanderbilt', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Vanderbilt Stadium';
update public.sports_venues set league='NCAA FB · Notre Dame', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Notre Dame Stadium add-on';
update public.sports_venues set league='NCAA FB · Michigan', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Michigan Stadium detour through Ann Arbor';
update public.sports_venues set league='NCAA FB · Colorado', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Folsom Field';
update public.sports_venues set league='NCAA FB · Utah', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Rice-Eccles Stadium';
update public.sports_venues set league='NCAA FB · BYU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='LaVell Edwards Stadium';
update public.sports_venues set league='NCAA FB · Montana', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Washington-Grizzly Stadium';
update public.sports_venues set league='NCAA FB · Stanford', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Stanford Stadium';
update public.sports_venues set league='NCAA FB · Washington', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Husky Stadium';
update public.sports_venues set league='NCAA FB · Georgia Tech', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Bobby Dodd Stadium at Georgia Tech';
update public.sports_venues set league='NCAA FB · Georgia', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Sanford Stadium in Athens optional detour';
update public.sports_venues set league='NCAA FB · Arizona State', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Mountain America Stadium at Arizona State';
update public.sports_venues set league='NCAA FB · SMU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Gerald J. Ford Stadium at SMU';
update public.sports_venues set league='NCAA FB · Tulane', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Tulane Yulman Stadium';
update public.sports_venues set league='NCAA FB · Rice', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Rice Stadium';
update public.sports_venues set league='NCAA FB · Houston', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='TDECU Stadium';
update public.sports_venues set league='NCAA FB · McMahon', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='McMahon Stadium';
update public.sports_venues set league='NCAA FB · Wyoming', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='University of Wyoming add-on';
update public.sports_venues set league='NCAA FB · NDSU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Fargodome if extending';
update public.sports_venues set league='NCAA FB · Arizona', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Arizona Stadium';
update public.sports_venues set league='NCAA FB · Rose Bowl', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Rose Bowl';
update public.sports_venues set league='NCAA FB · Dallas', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Cotton Bowl Stadium';
update public.sports_venues set league='NCAA FB · Levi''s Stadium', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Levi''s Stadium';

-- Soccer / Football (International)
update public.sports_venues set league='Ligue 1', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Stade de France','Parc des Princes');
update public.sports_venues set league='Premier League', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Wembley','Wembley Stadium','Old Trafford','Anfield','Etihad Stadium','Emirates Stadium','Stamford Bridge','Tottenham Hotspur Stadium');
update public.sports_venues set league='La Liga', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Estadio Azteca','Estadio Olímpico Universitario');
update public.sports_venues set league='Primeira Liga', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Estádio da Luz','Estádio José Alvalade','Estádio do Dragão');
update public.sports_venues set league='GAA', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Croke Park','Aviva Stadium');
update public.sports_venues set league='Super League', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Letzigrund Stadium';
update public.sports_venues set league='Úrvalsdeild', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Laugardalsvöllur national stadium';
update public.sports_venues set league='Eliteserien', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Ullevaal Stadion';
update public.sports_venues set league='All Blacks / NRL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Eden Park';
update public.sports_venues set league='Serie A', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Stadio Olimpico','San Siro if adding Milan','Stadio Artemio Franchi');
update public.sports_venues set league='Liga MX', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Estadio Caliente';
update public.sports_venues set league='Celtic · SPL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Celtic Park';
update public.sports_venues set league='Rangers · SPL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Ibrox';
update public.sports_venues set league='Scotland National', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Hampden Park';
update public.sports_venues set league='AFL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('MCG','Accor Stadium');

-- Rugby
update public.sports_venues set league='Rugby · England', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Twickenham';
update public.sports_venues set league='Rugby · Scotland', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Murrayfield';

-- Cricket
update public.sports_venues set league='Cricket · MCC', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Lord''s','Lord''s Cricket Ground');
update public.sports_venues set league='Cricket', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Sydney Cricket Ground';

-- Minor League / Independent Baseball
update public.sports_venues set league='Minor League Baseball', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Hadlock Field in Portland','SRP Park in North Augusta','Grayson Stadium / Savannah Bananas','Nat Bailey Stadium');

-- Japan Baseball
update public.sports_venues set league='NPB', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name in ('Tokyo Dome','Meiji Jingu Stadium','Koshien Stadium');

-- Hall of Fame / Landmarks
update public.sports_venues set league='Hall of Fame', venue_type='Museum' where household_id='00000000-0000-0000-0000-000000000001' and name='Hockey Hall of Fame';


-- Fix incorrect assignments from earlier in this migration
update public.sports_venues set league='CFL · Calgary Stampeders', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='McMahon Stadium';
update public.sports_venues set league='NFL · 49ers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Levi''s Stadium';
update public.sports_venues set league='NCAA FB · Various', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Rose Bowl';
update public.sports_venues set league='NCAA FB · SMU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Cotton Bowl Stadium';

-- Remaining NCAA venues
update public.sports_venues set league='NCAA FB · Arizona State', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Mountain America Stadium at Arizona State';
update public.sports_venues set league='NCAA FB · Sun Bowl', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Sun Bowl Stadium';
update public.sports_venues set league='NCAA BB · Alaska', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name='Alaska Airlines Center';
update public.sports_venues set league='NCAA FB · Hawaii', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='University of Hawaiʻi athletics';
update public.sports_venues set league='Gaelic Athletics', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Gaelic games';
update public.sports_venues set league='NPB · Tokyo', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Tokyo Dome';

-- Vague placeholder venues — mark as Experience so they don't show empty badges
update public.sports_venues set league='Local Sports', venue_type='Experience' where household_id='00000000-0000-0000-0000-000000000001' and name in (
  'Montreal sports add-on',
  'Memorial University athletics',
  'George V Park soccer history',
  'Dalhousie athletics',
  'Dartmouth athletics',
  'Fenway Park add-on through Boston',
  'Miami sports add-on',
  'Jackson Hole rodeo',
  'University of Wyoming add-on',
  'Iditarod history stops',
  'Winter sports venues vary by destination',
  'sumo venues',
  'winter sports venues',
  'ski resort events',
  'rugby venues',
  'Swiss hockey arenas',
  'Von Braun Center'
);

-- Additional venue type for MLS
update public.sports_venues set league='MLS · Inter Miami', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Inter Miami CF';
update public.sports_venues set league='MLS · FC Dallas', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name='Toyota Stadium in Frisco';
update public.sports_venues set league='MASL · Huntsville', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name='Toyota Field in Madison/Huntsville';
