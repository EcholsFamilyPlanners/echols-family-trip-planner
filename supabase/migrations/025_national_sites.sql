-- Travel OS — National Sites Tracker
-- Separate table for Presidential Libraries, National Parks, National Monuments
-- Run in Supabase SQL Editor.

create table if not exists public.national_sites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default '00000000-0000-0000-0000-000000000001',
  name text not null,
  city text default '',
  state_region text default '',
  country text default 'United States',
  site_type text not null default 'National Park' check (site_type in ('National Park','National Monument','Presidential Library','National Historic Site','National Memorial','Other')),
  notes text default '',
  visited boolean default false,
  visited_date date default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.national_sites enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='national_sites' and policyname='Household can read sites') then
    create policy "Household can read sites" on public.national_sites for select using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='national_sites' and policyname='Household can insert sites') then
    create policy "Household can insert sites" on public.national_sites for insert with check (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='national_sites' and policyname='Household can update sites') then
    create policy "Household can update sites" on public.national_sites for update using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='national_sites' and policyname='Household can delete sites') then
    create policy "Household can delete sites" on public.national_sites for delete using (household_id = '00000000-0000-0000-0000-000000000001'); end if; end $$;

create index if not exists national_sites_idx on public.national_sites (household_id, site_type);

-- ── PRESIDENTIAL LIBRARIES ───────────────────────────
insert into public.national_sites (household_id, name, city, state_region, site_type, notes, visited) values
('00000000-0000-0000-0000-000000000001','Herbert Hoover Presidential Library & Museum','West Branch','Iowa','Presidential Library','31st President — birthplace and burial site on grounds',false),
('00000000-0000-0000-0000-000000000001','Franklin D. Roosevelt Presidential Library & Museum','Hyde Park','New York','Presidential Library','32nd President — first Presidential library, opened 1941',false),
('00000000-0000-0000-0000-000000000001','Harry S. Truman Presidential Library & Museum','Independence','Missouri','Presidential Library','33rd President — Truman buried on the grounds',false),
('00000000-0000-0000-0000-000000000001','Dwight D. Eisenhower Presidential Library & Museum','Abilene','Kansas','Presidential Library','34th President — Eisenhower buried in the Place of Meditation on site',false),
('00000000-0000-0000-0000-000000000001','John F. Kennedy Presidential Library & Museum','Boston','Massachusetts','Presidential Library','35th President — stunning I.M. Pei design on Columbia Point',false),
('00000000-0000-0000-0000-000000000001','Lyndon B. Johnson Presidential Library','Austin','Texas','Presidential Library','36th President — on the UT Austin campus',false),
('00000000-0000-0000-0000-000000000001','Richard Nixon Presidential Library & Museum','Yorba Linda','California','Presidential Library','37th President — birthplace and burial site on grounds',false),
('00000000-0000-0000-0000-000000000001','Gerald R. Ford Presidential Library','Ann Arbor','Michigan','Presidential Library','38th President — library in Ann Arbor',false),
('00000000-0000-0000-0000-000000000001','Gerald R. Ford Presidential Museum','Grand Rapids','Michigan','Presidential Library','38th President — museum location, Ford buried here',false),
('00000000-0000-0000-0000-000000000001','Jimmy Carter Presidential Library & Museum','Atlanta','Georgia','Presidential Library','39th President — adjacent to Carter Center',false),
('00000000-0000-0000-0000-000000000001','Ronald Reagan Presidential Library & Museum','Simi Valley','California','Presidential Library','40th President — Air Force One on display, Reagan buried on grounds',false),
('00000000-0000-0000-0000-000000000001','George H.W. Bush Presidential Library & Museum','College Station','Texas','Presidential Library','41st President — on Texas A&M campus, Bush buried on grounds',false),
('00000000-0000-0000-0000-000000000001','William J. Clinton Presidential Library & Museum','Little Rock','Arkansas','Presidential Library','42nd President — stunning design on the Arkansas River',false),
('00000000-0000-0000-0000-000000000001','George W. Bush Presidential Library & Museum','Dallas','Texas','Presidential Library','43rd President — on the SMU campus',false),
('00000000-0000-0000-0000-000000000001','Barack Obama Presidential Center','Chicago','Illinois','Presidential Library','44th President — under construction in Jackson Park',false)
on conflict do nothing;

-- ── US NATIONAL PARKS (63 designated parks) ─────────
insert into public.national_sites (household_id, name, city, state_region, site_type, notes, visited) values
('00000000-0000-0000-0000-000000000001','Acadia National Park','Bar Harbor','Maine','National Park','Mountains meet the Atlantic Ocean',false),
('00000000-0000-0000-0000-000000000001','Arches National Park','Moab','Utah','National Park','Over 2,000 natural sandstone arches',false),
('00000000-0000-0000-0000-000000000001','Badlands National Park','Interior','South Dakota','National Park','Dramatic eroded buttes and pinnacles',false),
('00000000-0000-0000-0000-000000000001','Big Bend National Park','Big Bend','Texas','National Park','Where the Chihuahuan Desert meets the Rio Grande',false),
('00000000-0000-0000-0000-000000000001','Biscayne National Park','Homestead','Florida','National Park','Coral reefs and keys near Miami',false),
('00000000-0000-0000-0000-000000000001','Black Canyon of the Gunnison National Park','Gunnison','Colorado','National Park','Dramatic dark narrow canyon',false),
('00000000-0000-0000-0000-000000000001','Bryce Canyon National Park','Bryce','Utah','National Park','Famous for crimson-colored hoodoos',false),
('00000000-0000-0000-0000-000000000001','Canyonlands National Park','Moab','Utah','National Park','Vast wilderness of canyons and mesas',false),
('00000000-0000-0000-0000-000000000001','Capitol Reef National Park','Torrey','Utah','National Park','Hidden treasure of Utah canyon country',false),
('00000000-0000-0000-0000-000000000001','Carlsbad Caverns National Park','Carlsbad','New Mexico','National Park','Over 100 caves including the Big Room',false),
('00000000-0000-0000-0000-000000000001','Channel Islands National Park','Ventura','California','National Park','Five islands off the Southern California coast',false),
('00000000-0000-0000-0000-000000000001','Congaree National Park','Hopkins','South Carolina','National Park','Old-growth bottomland hardwood forest',false),
('00000000-0000-0000-0000-000000000001','Crater Lake National Park','Crater Lake','Oregon','National Park','Deepest lake in the US — stunning blue water',false),
('00000000-0000-0000-0000-000000000001','Cuyahoga Valley National Park','Brecksville','Ohio','National Park','Scenic river valley between Cleveland and Akron',false),
('00000000-0000-0000-0000-000000000001','Death Valley National Park','Death Valley','California','National Park','Hottest, driest, lowest national park',false),
('00000000-0000-0000-0000-000000000001','Denali National Park','Denali Park','Alaska','National Park','Home of North America''s highest peak',false),
('00000000-0000-0000-0000-000000000001','Dry Tortugas National Park','Key West','Florida','National Park','Remote fort and reef only reachable by boat or seaplane',false),
('00000000-0000-0000-0000-000000000001','Everglades National Park','Homestead','Florida','National Park','The only subtropical wilderness in North America',false),
('00000000-0000-0000-0000-000000000001','Gates of the Arctic National Park','Bettles','Alaska','National Park','America''s northernmost and most remote park',false),
('00000000-0000-0000-0000-000000000001','Gateway Arch National Park','St. Louis','Missouri','National Park','The Gateway Arch — tallest arch in the world',false),
('00000000-0000-0000-0000-000000000001','Glacier National Park','West Glacier','Montana','National Park','Going-to-the-Sun Road and stunning alpine scenery',false),
('00000000-0000-0000-0000-000000000001','Glacier Bay National Park','Gustavus','Alaska','National Park','Tidewater glaciers and wildlife',false),
('00000000-0000-0000-0000-000000000001','Grand Canyon National Park','Grand Canyon','Arizona','National Park','One of the seven natural wonders of the world',false),
('00000000-0000-0000-0000-000000000001','Grand Teton National Park','Moose','Wyoming','National Park','Dramatic Teton Range rising above Jackson Hole',false),
('00000000-0000-0000-0000-000000000001','Great Basin National Park','Baker','Nevada','National Park','Ancient bristlecone pines and Lehman Caves',false),
('00000000-0000-0000-0000-000000000001','Great Sand Dunes National Park','Mosca','Colorado','National Park','Tallest sand dunes in North America',false),
('00000000-0000-0000-0000-000000000001','Great Smoky Mountains National Park','Gatlinburg','Tennessee','National Park','Most visited national park in the US',false),
('00000000-0000-0000-0000-000000000001','Guadalupe Mountains National Park','Salt Flat','Texas','National Park','Highest peaks in Texas',false),
('00000000-0000-0000-0000-000000000001','Haleakalā National Park','Makawao','Hawaii','National Park','Massive dormant volcano on Maui',false),
('00000000-0000-0000-0000-000000000001','Hawaiʻi Volcanoes National Park','Volcano','Hawaii','National Park','Active volcanoes on the Big Island',false),
('00000000-0000-0000-0000-000000000001','Hot Springs National Park','Hot Springs','Arkansas','National Park','Historic thermal springs in downtown Hot Springs',false),
('00000000-0000-0000-0000-000000000001','Indiana Dunes National Park','Porter','Indiana','National Park','Sand dunes along Lake Michigan',false),
('00000000-0000-0000-0000-000000000001','Isle Royale National Park','Houghton','Michigan','National Park','Remote island wilderness in Lake Superior',false),
('00000000-0000-0000-0000-000000000001','Joshua Tree National Park','Twentynine Palms','California','National Park','Where the Mojave and Colorado deserts meet',false),
('00000000-0000-0000-0000-000000000001','Katmai National Park','King Salmon','Alaska','National Park','Famous for bears catching salmon at Brooks Falls',false),
('00000000-0000-0000-0000-000000000001','Kenai Fjords National Park','Seward','Alaska','National Park','Dramatic fjords and tidewater glaciers',false),
('00000000-0000-0000-0000-000000000001','Kings Canyon National Park','Fresno','California','National Park','Giant sequoias and deep canyon',false),
('00000000-0000-0000-0000-000000000001','Kobuk Valley National Park','Kotzebue','Alaska','National Park','Arctic sand dunes and caribou migration',false),
('00000000-0000-0000-0000-000000000001','Lake Clark National Park','Port Alsworth','Alaska','National Park','Wild Alaska — volcanoes, rivers, coastline',false),
('00000000-0000-0000-0000-000000000001','Lassen Volcanic National Park','Mineral','California','National Park','Hydrothermal areas and volcanic features',false),
('00000000-0000-0000-0000-000000000001','Mammoth Cave National Park','Mammoth Cave','Kentucky','National Park','Longest known cave system in the world',false),
('00000000-0000-0000-0000-000000000001','Mesa Verde National Park','Cortez','Colorado','National Park','Cliff dwellings of the ancestral Puebloans',false),
('00000000-0000-0000-0000-000000000001','Mount Rainier National Park','Ashford','Washington','National Park','Glaciated peak rising above surrounding lands',false),
('00000000-0000-0000-0000-000000000001','Mount Rushmore — Keystone','Keystone','South Dakota','National Memorial','Four US presidents carved into granite',false),
('00000000-0000-0000-0000-000000000001','North Cascades National Park','Newhalem','Washington','National Park','Rugged mountain wilderness',false),
('00000000-0000-0000-0000-000000000001','Olympic National Park','Port Angeles','Washington','National Park','Temperate rainforest, mountains, and coastline',false),
('00000000-0000-0000-0000-000000000001','Petrified Forest National Park','Petrified Forest','Arizona','National Park','Ancient petrified wood and Painted Desert',false),
('00000000-0000-0000-0000-000000000001','Pinnacles National Park','Paicines','California','National Park','Remnants of an ancient volcano',false),
('00000000-0000-0000-0000-000000000001','Redwood National Park','Crescent City','California','National Park','Tallest trees on Earth',false),
('00000000-0000-0000-0000-000000000001','Rocky Mountain National Park','Estes Park','Colorado','National Park','Trail Ridge Road and stunning peaks',false),
('00000000-0000-0000-0000-000000000001','Saguaro National Park','Tucson','Arizona','National Park','Forest of giant saguaro cacti',false),
('00000000-0000-0000-0000-000000000001','Sequoia National Park','Three Rivers','California','National Park','Home of the largest trees on Earth',false),
('00000000-0000-0000-0000-000000000001','Shenandoah National Park','Luray','Virginia','National Park','Skyline Drive and Blue Ridge Mountains',false),
('00000000-0000-0000-0000-000000000001','Theodore Roosevelt National Park','Medora','North Dakota','National Park','Badlands where TR ranched and found his calling',false),
('00000000-0000-0000-0000-000000000001','Virgin Islands National Park','Cruz Bay','US Virgin Islands','National Park','Tropical beaches and coral reefs',false),
('00000000-0000-0000-0000-000000000001','Voyageurs National Park','International Falls','Minnesota','National Park','Lakes and boreal forest on the Canadian border',false),
('00000000-0000-0000-0000-000000000001','White Sands National Park','Alamogordo','New Mexico','National Park','Stunning white gypsum dunes',false),
('00000000-0000-0000-0000-000000000001','Wind Cave National Park','Hot Springs','South Dakota','National Park','One of the longest caves in the world',false),
('00000000-0000-0000-0000-000000000001','Wrangell-St. Elias National Park','Copper Center','Alaska','National Park','Largest national park in the US',false),
('00000000-0000-0000-0000-000000000001','Yellowstone National Park','Yellowstone','Wyoming','National Park','First national park — geysers and wildlife',false),
('00000000-0000-0000-0000-000000000001','Yosemite National Park','Yosemite Valley','California','National Park','El Capitan, Half Dome, and Yosemite Falls',false),
('00000000-0000-0000-0000-000000000001','Zion National Park','Springdale','Utah','National Park','Red canyon walls and the Narrows',false)
on conflict do nothing;

-- ── KEY NATIONAL MONUMENTS ───────────────────────────
insert into public.national_sites (household_id, name, city, state_region, site_type, notes, visited) values
('00000000-0000-0000-0000-000000000001','Statue of Liberty National Monument','New York','New York','National Monument','Icon of freedom in New York Harbor',false),
('00000000-0000-0000-0000-000000000001','Lincoln Memorial','Washington DC','DC','National Memorial','Iconic memorial on the National Mall',false),
('00000000-0000-0000-0000-000000000001','Washington Monument','Washington DC','DC','National Memorial','Tallest obelisk in the world',false),
('00000000-0000-0000-0000-000000000001','Vietnam Veterans Memorial','Washington DC','DC','National Memorial','The Wall — 58,000 names',false),
('00000000-0000-0000-0000-000000000001','World War II Memorial','Washington DC','DC','National Memorial','Honoring the 16 million who served',false),
('00000000-0000-0000-0000-000000000001','Korean War Veterans Memorial','Washington DC','DC','National Memorial','The Forgotten War remembered',false),
('00000000-0000-0000-0000-000000000001','Martin Luther King Jr. Memorial','Washington DC','DC','National Memorial','Stone of Hope on the National Mall',false),
('00000000-0000-0000-0000-000000000001','Gettysburg National Military Park','Gettysburg','Pennsylvania','National Historic Site','Turning point of the Civil War',false),
('00000000-0000-0000-0000-000000000001','Antietam National Battlefield','Sharpsburg','Maryland','National Historic Site','Bloodiest single day in American history',false),
('00000000-0000-0000-0000-000000000001','Pearl Harbor National Memorial','Honolulu','Hawaii','National Memorial','USS Arizona Memorial — December 7 1941',false),
('00000000-0000-0000-0000-000000000001','Alcatraz Island','San Francisco','California','National Historic Site','The Rock — infamous federal penitentiary',false),
('00000000-0000-0000-0000-000000000001','Devils Tower National Monument','Hulett','Wyoming','National Monument','First national monument — sacred to Native Americans',false),
('00000000-0000-0000-0000-000000000001','Monument Valley Navajo Tribal Park','Oljato-Monument Valley','Arizona','National Monument','Iconic red sandstone mittens and buttes',false),
('00000000-0000-0000-0000-000000000001','Grand Staircase-Escalante National Monument','Escalante','Utah','National Monument','Vast and remote canyon country',false),
('00000000-0000-0000-0000-000000000001','Chaco Culture National Historical Park','Nageezi','New Mexico','National Historic Site','Ancient Puebloan great houses',false)
on conflict do nothing;
