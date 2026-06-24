
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getLocal, setLocal, HOUSEHOLD_ID } from '../utils/helpers';

const LOCAL = {
  shared: 'travelos_v3_shared_trip_data',
  personal: 'travelos_v3_personal_trip_data',
  custom: 'travelos_v3_custom_trips',
  packingTemplates: 'travelos_v3_packing_templates',
  packingItems: 'travelos_v3_packing_items',
  venues: 'travelos_v3_sports_venues',
  inbox: 'travelos_v3_idea_inbox'
};

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) throw error;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

export async function ensureHouseholdMember(session) {
  if (!isSupabaseConfigured || !session?.user?.id) return;

  const email = session.user.email || '';
  const displayName = email.toLowerCase().includes('steph') ? 'Stephanie' : email.toLowerCase().includes('acechols') ? 'Anthony' : email.split('@')[0];

  const { error } = await supabase.from('household_members').upsert({
    household_id: HOUSEHOLD_ID,
    user_id: session.user.id,
    email,
    display_name: displayName,
    nickname: displayName,
    role: 'member'
  }, { onConflict: 'household_id,user_id' });

  if (error) console.error(error);
}

export function loadIdeaInbox() {
  return localStorage.getItem(LOCAL.inbox) || '';
}

export function saveIdeaInbox(value) {
  localStorage.setItem(LOCAL.inbox, value);
}

export async function loadAllData(seedDestinations = []) {
  if (!isSupabaseConfigured) {
    return {
      sharedTripData: getLocal(LOCAL.shared, {}),
      personalTripData: getLocal(LOCAL.personal, {}),
      allPersonalTripData: [],
      householdMembers: [],
      customTrips: getLocal(LOCAL.custom, []),
      packingTemplates: getLocal(LOCAL.packingTemplates, defaultTemplates()),
      packingItems: getLocal(LOCAL.packingItems, defaultPackingItems()),
      sportsVenues: [...seedVenues(seedDestinations), ...getLocal(LOCAL.venues, [])],
    };
  }

  const [
    sharedRes,
    personalRes,
    customRes,
    templatesRes,
    packingRes,
    venuesRes,
    membersRes,
  ] = await Promise.all([
    supabase.from('shared_trip_data').select('*').eq('household_id', HOUSEHOLD_ID),
    supabase.from('personal_trip_data').select('*').eq('household_id', HOUSEHOLD_ID),
    supabase.from('custom_trips_v3').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at'),
    supabase.from('packing_templates').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at'),
    supabase.from('packing_items').select('*').eq('household_id', HOUSEHOLD_ID).order('sort_order'),
    supabase.from('sports_venues').select('*').eq('household_id', HOUSEHOLD_ID).order('name'),
    supabase.from('household_members').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at'),
  ]);

  for (const res of [sharedRes, personalRes, customRes, templatesRes, packingRes, venuesRes, membersRes]) {
    if (res.error) console.error(res.error);
  }

  const sharedTripData = {};
  (sharedRes.data || []).forEach(row => { sharedTripData[row.trip_id] = row; });

  const session = await getSession();
  const allPersonalTripData = personalRes.data || [];
  const personalTripData = {};
  allPersonalTripData
    .filter(row => !session?.user?.id || row.user_id === session.user.id)
    .forEach(row => { personalTripData[row.trip_id] = row; });

  const dbVenues = venuesRes.data || [];
  const dbVenueNames = new Set(dbVenues.map(v => (v.name || '').toLowerCase()));

  return {
    sharedTripData,
    personalTripData,
    allPersonalTripData,
    householdMembers: membersRes.data || [],
    customTrips: (customRes.data || []).map(row => row.trip),
    packingTemplates: templatesRes.data || defaultTemplates(),
    packingItems: packingRes.data || defaultPackingItems(),
    sportsVenues: [...seedVenues(seedDestinations).filter(v => !dbVenueNames.has(v.name.toLowerCase())), ...dbVenues],
  };
}

export async function saveSharedTripPatch(tripId, patch, current = {}) {
  const next = { ...current, ...patch };
  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL.shared, {});
    all[tripId] = next;
    setLocal(LOCAL.shared, all);
    return next;
  }

  const session = await getSession();
  const payload = {
    household_id: HOUSEHOLD_ID,
    trip_id: tripId,
    status: next.status || 'Idea',
    shared_notes: next.shared_notes || next.sharedNotes || '',
    ideas: next.ideas || '',
    restaurant_notes: next.restaurant_notes || next.restaurantNotes || '',
    memories: next.memories || '',
    packing: next.packing || '',
    budget_notes: next.budget_notes || next.budgetNotes || '',
    itinerary_notes: next.itinerary_notes || next.itineraryNotes || '',
    hotel_notes: next.hotel_notes || next.hotelNotes || '',
    flight_notes: next.flight_notes || next.flightNotes || '',
    reservation_notes: next.reservation_notes || next.reservationNotes || '',
    map_notes: next.map_notes || next.mapNotes || '',
    document_notes: next.document_notes || next.documentNotes || '',
    post_trip_summary: next.post_trip_summary || next.postTripSummary || '',
    what_worked: next.what_worked || next.whatWorked || '',
    what_to_change: next.what_to_change || next.whatToChange || '',
    updated_by: session?.user?.id || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('shared_trip_data').upsert(payload, { onConflict: 'household_id,trip_id' });
  if (error) throw error;
  return next;
}

export async function savePersonalTripPatch(tripId, patch, current = {}) {
  const next = { ...current, ...patch };
  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL.personal, {});
    all[tripId] = next;
    setLocal(LOCAL.personal, all);
    return next;
  }

  const session = await getSession();
  if (!session?.user?.id) throw new Error('Sign in required.');

  const payload = {
    household_id: HOUSEHOLD_ID,
    user_id: session.user.id,
    trip_id: tripId,
    favorite: !!next.favorite,
    want_to_visit: !!next.want_to_visit,
    wish_list: !!next.wish_list,
    wish_rank: next.wish_rank || null,
    personal_rating: next.personal_rating || null,
    personal_notes: next.personal_notes || '',
    dream_reason: next.dream_reason || '',
    must_do: next.must_do || '',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('personal_trip_data').upsert(payload, { onConflict: 'household_id,user_id,trip_id' });
  if (error) throw error;
  return next;
}

export async function addCustomTrip(trip) {
  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL.custom, []);
    setLocal(LOCAL.custom, [...all, trip]);
    return;
  }
  const session = await getSession();
  const { error } = await supabase.from('custom_trips_v3').insert({
    household_id: HOUSEHOLD_ID,
    trip,
    created_by: session?.user?.id || null
  });
  if (error) throw error;
}

export async function savePackingItem(item) {
  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL.packingItems, defaultPackingItems());
    const exists = all.some(x => x.id === item.id);
    setLocal(LOCAL.packingItems, exists ? all.map(x => x.id === item.id ? item : x) : [...all, { ...item, id: crypto.randomUUID() }]);
    return;
  }
  const session = await getSession();
  const payload = { ...item, household_id: HOUSEHOLD_ID, updated_by: session?.user?.id || null, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('packing_items').upsert(payload);
  if (error) throw error;
}

export async function addPackingTemplate(name, travel_type = 'general') {
  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL.packingTemplates, defaultTemplates());
    setLocal(LOCAL.packingTemplates, [...all, { id: crypto.randomUUID(), name, travel_type }]);
    return;
  }
  const session = await getSession();
  const { error } = await supabase.from('packing_templates').insert({
    household_id: HOUSEHOLD_ID,
    name,
    travel_type,
    created_by: session?.user?.id || null
  });
  if (error) throw error;
}

export async function saveSportsVenue(venue) {
  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL.venues, []);
    const nextVenue = { ...venue, id: String(venue.id || '').startsWith('seed-') ? crypto.randomUUID() : (venue.id || crypto.randomUUID()) };
    const exists = all.some(v => v.id === nextVenue.id || v.name === nextVenue.name);
    setLocal(LOCAL.venues, exists ? all.map(v => (v.id === nextVenue.id || v.name === nextVenue.name) ? nextVenue : v) : [...all, nextVenue]);
    return;
  }

  const session = await getSession();
  const payload = {
    id: venue.id && !String(venue.id).startsWith('seed-') ? venue.id : undefined,
    household_id: HOUSEHOLD_ID,
    name: venue.name,
    city: venue.city || '',
    state_region: venue.state_region || '',
    country: venue.country || 'United States',
    venue_type: venue.venue_type || 'Stadium',
    league: venue.league || '',
    associated_trip_id: venue.associated_trip_id || null,
    notes: venue.notes || '',
    visited: !!venue.visited,
    visited_date: venue.visited_date || null,
    created_by: session?.user?.id || null,
    updated_by: session?.user?.id || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('sports_venues').upsert(payload);
  if (error) throw error;
}

function seedVenues(destinations) {
  return destinations.flatMap(trip => (trip.sports || []).map(name => ({
    id: `seed-${trip.id}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    city: '',
    state_region: '',
    country: '',
    venue_type: 'Trip Venue',
    league: '',
    associated_trip_id: trip.id,
    notes: trip.title,
    visited: false,
    seeded: true
  })));
}



export async function saveHouseholdMember(member) {
  if (!isSupabaseConfigured) return;

  const payload = {
    id: member.id,
    household_id: HOUSEHOLD_ID,
    user_id: member.user_id,
    email: member.email || '',
    display_name: member.display_name || member.nickname || member.email || 'Traveler',
    nickname: member.nickname || member.display_name || 'Traveler',
    role: member.role || 'member',
    is_active: member.is_active !== false
  };

  const { error } = await supabase.from('household_members').upsert(payload);
  if (error) throw error;
}

export async function createHouseholdMemberByEmail({ email, display_name, nickname }) {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('household_members').insert({
    household_id: HOUSEHOLD_ID,
    email,
    display_name: display_name || nickname || email,
    nickname: nickname || display_name || email,
    role: 'member',
    is_active: true
  });

  if (error) throw error;
}


function defaultTemplates() {
  return [
    { id:'local-flight', name:'Weekend Flight', travel_type:'air' },
    { id:'local-car', name:'Road Trip', travel_type:'car' },
    { id:'local-europe', name:'Europe 10 Days', travel_type:'international' },
    { id:'local-golf', name:'Golf Weekend', travel_type:'golf' },
  ];
}

function defaultPackingItems() {
  const rows = [
    ['local-flight','Documents','Driver license / ID'], ['local-flight','Documents','Flight confirmation'], ['local-flight','Electronics','Phone charger'], ['local-flight','Clothing','Comfortable walking shoes'],
    ['local-car','Documents','Driver license'], ['local-car','Car','Phone mount'], ['local-car','Car','Car charger'], ['local-car','Comfort','Cooler'], ['local-car','Extras','Stadium/photo stop list'],
    ['local-europe','Documents','Passport'], ['local-europe','Electronics','Plug adapters'], ['local-europe','Clothing','Comfortable walking shoes'],
    ['local-golf','Golf','Golf shoes'], ['local-golf','Golf','Golf balls'], ['local-golf','Golf','Golf clothes']
  ];
  return rows.map((r, i) => ({ id:`local-pack-${i}`, template_id:r[0], category:r[1], item:r[2], packed:false, sort_order:i }));
}
