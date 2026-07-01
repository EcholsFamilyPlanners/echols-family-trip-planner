-- Travel OS V6.7 — Comprehensive venue fix using ILIKE partial matching
-- This replaces migration 023 logic with fuzzy matching that actually works.
-- Run in Supabase SQL Editor.

-- ── Remove Presidential Libraries from sports_venues ──
delete from public.sports_venues 
where household_id = '00000000-0000-0000-0000-000000000001'
and venue_type = 'Presidential Library';

-- ── NHL ──────────────────────────────────────────────
update public.sports_venues set league='NHL', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Videotron%';
update public.sports_venues set league='NHL · Flames', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Saddledome%';
update public.sports_venues set league='NHL · Maple Leafs', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Scotiabank Arena%';
update public.sports_venues set league='NHL · Canucks', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Rogers Arena%';
update public.sports_venues set league='NHL · Predators', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Bridgestone Arena%';
update public.sports_venues set league='NHL · Hurricanes', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Scotiabank Centre%';

-- ── MLB ──────────────────────────────────────────────
update public.sports_venues set league='MLB · Red Sox', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Fenway Park%';
update public.sports_venues set league='MLB · Blue Jays', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Rogers Centre%';
update public.sports_venues set league='MLB · Mariners', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%T-Mobile Park%';
update public.sports_venues set league='MLB · Giants', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Oracle Park%';
update public.sports_venues set league='MLB · Dodgers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Dodger Stadium%';
update public.sports_venues set league='MLB · Padres', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Petco Park%';
update public.sports_venues set league='MLB · Diamondbacks', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Chase Field%';
update public.sports_venues set league='MLB · Rockies', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Coors Field%';
update public.sports_venues set league='MLB · Astros', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Minute Maid Park%';
update public.sports_venues set league='MLB · Rangers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Globe Life Field%';
update public.sports_venues set league='MLB · Braves', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Truist Park%';
update public.sports_venues set league='MLB · Marlins', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%loanDepot%';
update public.sports_venues set league='MLB · Cubs', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Wrigley Field%';
update public.sports_venues set league='MLB · White Sox', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Guaranteed Rate%';
update public.sports_venues set league='MLB · Yankees', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Yankee Stadium%';
update public.sports_venues set league='MLB · Mets', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Citi Field%';
update public.sports_venues set league='Minor League Baseball', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Hadlock Field%';
update public.sports_venues set league='Minor League Baseball', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Nat Bailey%';
update public.sports_venues set league='Minor League Baseball', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%SRP Park%';
update public.sports_venues set league='MLB · Various', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Grayson Stadium%';
update public.sports_venues set league='MLB · Phillies', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Citizens Bank Park%';
update public.sports_venues set league='MLB · First Horizon', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%First Horizon Park%';
update public.sports_venues set league='NPB', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Tokyo Dome%';
update public.sports_venues set league='NPB', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Meiji Jingu%';
update public.sports_venues set league='NPB', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Koshien%';

-- ── NBA ──────────────────────────────────────────────
update public.sports_venues set league='NBA · Celtics', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%TD Garden%';
update public.sports_venues set league='NBA · Nets', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Barclays Center%';
update public.sports_venues set league='NBA · Knicks', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Madison Square Garden%';
update public.sports_venues set league='NBA · Heat', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Kaseya Center%';
update public.sports_venues set league='NBA · Pelicans', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Smoothie King%';
update public.sports_venues set league='NBA · Rockets', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Toyota Center%';
update public.sports_venues set league='NBA · Mavericks', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%American Airlines Center%';
update public.sports_venues set league='NBA · Bulls', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%United Center%';
update public.sports_venues set league='NBA · Nuggets', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Ball Arena%';
update public.sports_venues set league='NBA · Warriors', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Chase Center%';
update public.sports_venues set league='NBA · Suns', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Footprint Center%';
update public.sports_venues set league='NBA · Hawks', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%State Farm Arena%';
update public.sports_venues set league='NBA · Jazz', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Delta Center%';
update public.sports_venues set league='NBA · Clippers', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Intuit Dome%';
update public.sports_venues set league='NBA · Kings', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Golden 1 Center%';
update public.sports_venues set league='NBA · Trail Blazers', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Moda Center%';
update public.sports_venues set league='NHL · Kraken', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Climate Pledge%';
update public.sports_venues set league='NHL · Coyotes', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Viejas Arena%';
update public.sports_venues set league='NBA · Grizzlies', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%FedEx Forum%';
update public.sports_venues set league='Events Venue', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Von Braun Center%';

-- ── NFL ──────────────────────────────────────────────
update public.sports_venues set league='NFL · Patriots', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Gillette Stadium%';
update public.sports_venues set league='NFL · Giants/Jets', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%MetLife Stadium%';
update public.sports_venues set league='NFL · Dolphins', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Hard Rock Stadium%';
update public.sports_venues set league='NFL · Titans', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Nissan Stadium%';
update public.sports_venues set league='NFL · Saints', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Caesars Superdome%';
update public.sports_venues set league='NFL · Texans', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%NRG Stadium%';
update public.sports_venues set league='NFL · Bears', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Soldier Field%';
update public.sports_venues set league='NFL · Broncos', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Empower Field%';
update public.sports_venues set league='NFL · Seahawks', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Lumen Field%';
update public.sports_venues set league='NFL · Cowboys', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%AT&T Stadium%';
update public.sports_venues set league='NFL · Falcons', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Mercedes-Benz Stadium%';
update public.sports_venues set league='NFL · Cardinals', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%State Farm Stadium%';
update public.sports_venues set league='NFL · 49ers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Levi%Stadium%';
update public.sports_venues set league='NFL · Jaguars', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%TIAA Bank%';
update public.sports_venues set league='NFL · Buccaneers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Raymond James%';
update public.sports_venues set league='NFL · Panthers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Bank of America Stadium%';
update public.sports_venues set league='NFL · Rams/Chargers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%SoFi Stadium%';
update public.sports_venues set league='NFL · Raiders', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Allegiant Stadium%';
update public.sports_venues set league='NFL · Bills', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Highmark Stadium%';
update public.sports_venues set league='NFL · Steelers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Acrisure Stadium%';
update public.sports_venues set league='NFL · Bengals', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Paycor Stadium%';
update public.sports_venues set league='NFL · Browns', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Huntington Bank Field%';
update public.sports_venues set league='NFL · Lions', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Ford Field%';
update public.sports_venues set league='NFL · Packers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Lambeau Field%';
update public.sports_venues set league='NFL · Vikings', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%US Bank Stadium%';
update public.sports_venues set league='NFL · Colts', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Lucas Oil%';
update public.sports_venues set league='NFL · Chiefs', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Arrowhead Stadium%';
update public.sports_venues set league='NFL · Eagles', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Lincoln Financial%';
update public.sports_venues set league='NFL · Ravens', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%M&T Bank Stadium%';
update public.sports_venues set league='NFL · Commanders', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%FedExField%';

-- ── NCAA ─────────────────────────────────────────────
update public.sports_venues set league='NCAA FB · Michigan', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Michigan Stadium%';
update public.sports_venues set league='NCAA FB · Notre Dame', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Notre Dame Stadium%';
update public.sports_venues set league='NCAA FB · BYU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%LaVell Edwards%';
update public.sports_venues set league='NCAA FB · Colorado', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Folsom Field%';
update public.sports_venues set league='NCAA FB · Utah', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Rice-Eccles%';
update public.sports_venues set league='NCAA FB · Montana', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Washington-Grizzly%';
update public.sports_venues set league='NCAA FB · Stanford', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Stanford Stadium%';
update public.sports_venues set league='NCAA FB · Washington', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Husky Stadium%';
update public.sports_venues set league='NCAA FB · Georgia Tech', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Bobby Dodd%';
update public.sports_venues set league='NCAA FB · Georgia', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Sanford Stadium%';
update public.sports_venues set league='NCAA FB · Arizona State', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Mountain America Stadium%';
update public.sports_venues set league='NCAA FB · SMU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Gerald J. Ford Stadium%';
update public.sports_venues set league='NCAA FB · SMU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Cotton Bowl Stadium%';
update public.sports_venues set league='NCAA FB · Tulane', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Tulane%';
update public.sports_venues set league='NCAA FB · Rice', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Rice Stadium%';
update public.sports_venues set league='NCAA FB · Houston', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%TDECU%';
update public.sports_venues set league='CFL · Calgary', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%McMahon Stadium%';
update public.sports_venues set league='NCAA FB · Wyoming', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Wyoming%';
update public.sports_venues set league='NCAA FB · NDSU', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Fargodome%';
update public.sports_venues set league='NCAA FB · Arizona', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Arizona Stadium%';
update public.sports_venues set league='NCAA FB · Rose Bowl', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Rose Bowl%';
update public.sports_venues set league='NCAA FB · Harvard', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Harvard Stadium%';
update public.sports_venues set league='NCAA FB · Vanderbilt', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Vanderbilt Stadium%';
update public.sports_venues set league='NCAA FB · Sun Bowl', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Sun Bowl%';
update public.sports_venues set league='NCAA BB · Alaska', venue_type='Arena' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Alaska Airlines Center%';

-- ── PGA / Golf ───────────────────────────────────────
update public.sports_venues set league='PGA', venue_type='Golf Course' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Augusta National%';
update public.sports_venues set league='PGA', venue_type='Golf Course' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%St Andrews%';
update public.sports_venues set league='PGA', venue_type='Golf Course' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%TPC Scottsdale%';
update public.sports_venues set league='PGA', venue_type='Golf Course' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Sony Open%';

-- ── MLS ──────────────────────────────────────────────
update public.sports_venues set league='MLS · Nashville SC', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%GEODIS Park%';
update public.sports_venues set league='MLS · Toronto FC', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%BMO Field%';
update public.sports_venues set league='MLS · Inter Miami', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Inter Miami%';
update public.sports_venues set league='MLS · FC Dallas', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Toyota Stadium%';
update public.sports_venues set league='MLS', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Shell Energy Stadium%';
update public.sports_venues set league='MLS', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Snapdragon Stadium%';

-- ── International Soccer ─────────────────────────────
update public.sports_venues set league='Ligue 1', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Stade de France%';
update public.sports_venues set league='Ligue 1', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Parc des Princes%';
update public.sports_venues set league='Premier League', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Wembley%';
update public.sports_venues set league='Cricket · MCC', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Lord%s%';
update public.sports_venues set league='Rugby · England', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Twickenham%';
update public.sports_venues set league='Premier League · Man Utd', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Old Trafford%';
update public.sports_venues set league='Premier League · Liverpool', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Anfield%';
update public.sports_venues set league='Premier League · Man City', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Etihad Stadium%';
update public.sports_venues set league='Premier League · Arsenal', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Emirates Stadium%';
update public.sports_venues set league='Premier League · Chelsea', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Stamford Bridge%';
update public.sports_venues set league='Premier League · Spurs', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Tottenham%';
update public.sports_venues set league='SPL · Celtic', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Celtic Park%';
update public.sports_venues set league='SPL · Rangers', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Ibrox%';
update public.sports_venues set league='Scotland National', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Hampden Park%';
update public.sports_venues set league='Rugby · Scotland', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Murrayfield%';
update public.sports_venues set league='Serie A', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Stadio Olimpico%';
update public.sports_venues set league='Serie A · AC Milan', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%San Siro%';
update public.sports_venues set league='Serie A', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Artemio Franchi%';
update public.sports_venues set league='Primeira Liga', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Estádio da Luz%';
update public.sports_venues set league='Primeira Liga', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Alvalade%';
update public.sports_venues set league='Primeira Liga', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Dragão%';
update public.sports_venues set league='GAA', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Croke Park%';
update public.sports_venues set league='FAI', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Aviva Stadium%';
update public.sports_venues set league='Super League', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Letzigrund%';
update public.sports_venues set league='Úrvalsdeild', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Laugardalsvöllur%';
update public.sports_venues set league='Eliteserien', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Ullevaal%';
update public.sports_venues set league='NRL / All Blacks', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Eden Park%';
update public.sports_venues set league='AFL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%MCG%';
update public.sports_venues set league='AFL', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Accor Stadium%';
update public.sports_venues set league='Cricket', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Sydney Cricket Ground%';
update public.sports_venues set league='Liga MX', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Estadio Caliente%';
update public.sports_venues set league='Liga MX', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Estadio Azteca%';
update public.sports_venues set league='Liga MX', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Estadio Olímpico%';
update public.sports_venues set league='LigaMX', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Venados FC%';
update public.sports_venues set league='Baseball Mexico', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Estadio Kukulcán%';
update public.sports_venues set league='Baseball Mexico', venue_type='Stadium' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Estadio Eduardo Vasconcelos%';

-- ── Hockey / Hall of Fame ────────────────────────────
update public.sports_venues set league='Hall of Fame', venue_type='Museum' where household_id='00000000-0000-0000-0000-000000000001' and name ilike '%Hockey Hall of Fame%';

-- ── Remaining vague placeholders ─────────────────────
update public.sports_venues set league='Local Sports', venue_type='Experience'
where household_id='00000000-0000-0000-0000-000000000001'
and (league is null or league = '' or league = 'Trip Venue')
and (venue_type is null or venue_type = '' or venue_type = 'Trip Venue');
