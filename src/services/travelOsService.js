
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
  return localStorage.getItem('travelos_v3_idea_inbox') || '';
}

export function saveIdeaInbox(value) {
  localStorage.setItem('travelos_v3_idea_inbox', value);
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
      allVotes: [],
      myVotes: {},
      activityFeed: [],
      togetherNotes: '',
    };
  }

  const session = await getSession();

  const [
    sharedRes, personalRes, customRes, templatesRes,
    packingRes, venuesRes, membersRes, votesRes, activityRes,
  ] = await Promise.all([
    supabase.from('shared_trip_data').select('*').eq('household_id', HOUSEHOLD_ID),
    supabase.from('personal_trip_data').select('*').eq('household_id', HOUSEHOLD_ID),
    supabase.from('custom_trips_v3').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at'),
    supabase.from('packing_templates').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at'),
    supabase.from('packing_items').select('*').eq('household_id', HOUSEHOLD_ID).order('sort_order'),
    supabase.from('sports_venues').select('*').eq('household_id', HOUSEHOLD_ID).order('name'),
    supabase.from('household_members').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at'),
    supabase.from('trip_votes').select('*').eq('household_id', HOUSEHOLD_ID),
    supabase.from('activity_feed').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at', { ascending: false }).limit(40),
  ]);

  for (const res of [sharedRes, personalRes, customRes, templatesRes, packingRes, venuesRes, membersRes, votesRes, activityRes]) {
    if (res.error) console.error(res.error);
  }

  const sharedTripData = {};
  (sharedRes.data || []).forEach(row => { sharedTripData[row.trip_id] = row; });

  const allPersonalTripData = personalRes.data || [];
  const personalTripData = {};
  allPersonalTripData
    .filter(row => !session?.user?.id || row.user_id === session.user.id)
    .forEach(row => { personalTripData[row.trip_id] = row; });

  const allVotes = votesRes.data || [];
  const myVotes = {};
  allVotes
    .filter(row => row.user_id === session?.user?.id)
    .forEach(row => { myVotes[row.trip_id] = row.vote; });

  const dbVenues = venuesRes.data || [];
  const dbVenueNames = new Set(dbVenues.map(v => (v.name || '').toLowerCase()));

  // Together notes stored in shared_trip_data with a special trip_id
  const togetherRow = (sharedRes.data || []).find(r => r.trip_id === '__together__');
  const togetherNotes = togetherRow?.shared_notes || '';

  return {
    sharedTripData,
    personalTripData,
    allPersonalTripData,
    householdMembers: membersRes.data || [],
    customTrips: (customRes.data || []).map(row => row.trip),
    packingTemplates: templatesRes.data || defaultTemplates(),
    packingItems: packingRes.data || defaultPackingItems(),
    sportsVenues: [...seedVenues(seedDestinations).filter(v => !dbVenueNames.has(v.name.toLowerCase())), ...dbVenues],
    allVotes,
    myVotes,
    activityFeed: activityRes.data || [],
    togetherNotes,
  };
}

export async function logActivity({ userId, actorName, actionType, tripId, tripTitle, detail }) {
  if (!isSupabaseConfigured || !userId) return;
  const { error } = await supabase.from('activity_feed').insert({
    household_id: HOUSEHOLD_ID,
    user_id: userId,
    actor_name: actorName || 'Someone',
    action_type: actionType,
    trip_id: tripId || null,
    trip_title: tripTitle || null,
    detail: detail || null,
  });
  if (error) console.error('Activity log error:', error);
}

export async function saveTripVote(tripId, vote, tripTitle, actorName) {
  if (!isSupabaseConfigured) return;
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Sign in required.');

  const { error } = await supabase.from('trip_votes').upsert({
    household_id: HOUSEHOLD_ID,
    user_id: session.user.id,
    trip_id: tripId,
    vote,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'household_id,user_id,trip_id' });

  if (error) throw error;

  const VOTE_LABEL = { love: '❤️ Love', like: '👍 Like', maybe: '🤔 Maybe', pass: '👋 Pass' };
  await logActivity({
    userId: session.user.id,
    actorName: actorName || 'Someone',
    actionType: 'vote',
    tripId,
    tripTitle,
    detail: VOTE_LABEL[vote] || vote,
  });
}

export async function saveTogetherNotes(notes, actorName) {
  if (!isSupabaseConfigured) return;
  const session = await getSession();
  const payload = {
    household_id: HOUSEHOLD_ID,
    trip_id: '__together__',
    status: 'Idea',
    shared_notes: notes,
    updated_by: session?.user?.id || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('shared_trip_data').upsert(payload, { onConflict: 'household_id,trip_id' });
  if (error) throw error;
  if (session?.user?.id) {
    await logActivity({
      userId: session.user.id,
      actorName: actorName || 'Someone',
      actionType: 'together_note',
      detail: 'Updated shared planning notes',
    });
  }
}

export async function saveSharedTripPatch(tripId, patch, current = {}, actorName) {
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

  // Log status changes to activity feed
  if (patch.status && patch.status !== current.status && session?.user?.id) {
    await logActivity({
      userId: session.user.id,
      actorName: actorName || 'Someone',
      actionType: 'status',
      tripId,
      detail: `Status → ${patch.status}`,
    });
  }

  return next;
}

export async function savePersonalTripPatch(tripId, patch, current = {}, actorName) {
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

  // Log wish list changes
  if (patch.wish_list !== undefined && patch.wish_list !== current.wish_list && session?.user?.id) {
    await logActivity({
      userId: session.user.id,
      actorName: actorName || 'Someone',
      actionType: 'wish_list',
      tripId,
      detail: patch.wish_list ? 'Added to wish list' : 'Removed from wish list',
    });
  }

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
    name, city: '', state_region: '', country: '', venue_type: 'Trip Venue',
    league: '', associated_trip_id: trip.id, notes: trip.title, visited: false, seeded: true
  })));
}

export async function saveHouseholdMember(member) {
  if (!isSupabaseConfigured) return;
  const payload = {
    id: member.id, household_id: HOUSEHOLD_ID, user_id: member.user_id,
    email: member.email || '',
    display_name: member.display_name || member.nickname || member.email || 'Traveler',
    nickname: member.nickname || member.display_name || 'Traveler',
    role: member.role || 'member', is_active: member.is_active !== false
  };
  const { error } = await supabase.from('household_members').upsert(payload);
  if (error) throw error;
}

export async function createHouseholdMemberByEmail({ email, display_name, nickname }) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('household_members').insert({
    household_id: HOUSEHOLD_ID, email,
    display_name: display_name || nickname || email,
    nickname: nickname || display_name || email,
    role: 'member', is_active: true
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
    ['local-flight','Documents','Driver license / ID'], ['local-flight','Documents','Flight confirmation'],
    ['local-flight','Electronics','Phone charger'], ['local-flight','Clothing','Comfortable walking shoes'],
    ['local-car','Documents','Driver license'], ['local-car','Car','Phone mount'],
    ['local-car','Car','Car charger'], ['local-car','Comfort','Cooler'], ['local-car','Extras','Stadium/photo stop list'],
    ['local-europe','Documents','Passport'], ['local-europe','Electronics','Plug adapters'],
    ['local-europe','Clothing','Comfortable walking shoes'],
    ['local-golf','Golf','Golf shoes'], ['local-golf','Golf','Golf balls'], ['local-golf','Golf','Golf clothes']
  ];
  return rows.map((r, i) => ({ id:`local-pack-${i}`, template_id:r[0], category:r[1], item:r[2], packed:false, sort_order:i }));
}

// ── Sprint 3A: Hotel & Restaurant Shortlists ──────────

export async function loadTripShortlists(tripId) {
  if (!isSupabaseConfigured) return { hotels: [], restaurants: [] };
  const [hotelsRes, restsRes] = await Promise.all([
    supabase.from('trip_hotels').select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId).order('created_at'),
    supabase.from('trip_restaurants').select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId).order('created_at'),
  ]);
  if (hotelsRes.error) console.error(hotelsRes.error);
  if (restsRes.error) console.error(restsRes.error);
  return { hotels: hotelsRes.data || [], restaurants: restsRes.data || [] };
}

export async function saveHotel(hotel) {
  if (!isSupabaseConfigured) return;
  const payload = {
    ...hotel,
    household_id: HOUSEHOLD_ID,
    updated_at: new Date().toISOString(),
  };
  if (hotel.id) {
    const { error } = await supabase.from('trip_hotels').update(payload).eq('id', hotel.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('trip_hotels').insert(payload);
    if (error) throw error;
  }
}

export async function deleteHotel(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_hotels').delete().eq('id', id);
  if (error) throw error;
}

export async function saveRestaurant(restaurant) {
  if (!isSupabaseConfigured) return;
  const payload = {
    ...restaurant,
    household_id: HOUSEHOLD_ID,
    updated_at: new Date().toISOString(),
  };
  if (restaurant.id) {
    const { error } = await supabase.from('trip_restaurants').update(payload).eq('id', restaurant.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('trip_restaurants').insert(payload);
    if (error) throw error;
  }
}

export async function deleteRestaurant(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_restaurants').delete().eq('id', id);
  if (error) throw error;
}

// ── Sprint 3B: Per-Trip Budget Tracker ───────────────

export async function loadTripBudget(tripId) {
  if (!isSupabaseConfigured) return { target: 0, items: [] };
  const [budgetRes, itemsRes] = await Promise.all([
    supabase.from('trip_budget').select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId).maybeSingle(),
    supabase.from('trip_budget_items').select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId).order('sort_order'),
  ]);
  if (budgetRes.error) console.error(budgetRes.error);
  if (itemsRes.error) console.error(itemsRes.error);
  return { target: budgetRes.data?.target || 0, items: itemsRes.data || [] };
}

export async function saveTripBudgetTarget(tripId, target) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_budget').upsert({
    household_id: HOUSEHOLD_ID, trip_id: tripId,
    target: Number(target) || 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'trip_id' });
  if (error) throw error;
}

export async function saveBudgetItem(item) {
  if (!isSupabaseConfigured) return;
  const payload = {
    ...item,
    household_id: HOUSEHOLD_ID,
    estimated: Number(item.estimated) || 0,
    actual: (item.actual === '' || item.actual === null || item.actual === undefined) ? null : Number(item.actual),
    updated_at: new Date().toISOString(),
  };
  if (item.id) {
    const { error } = await supabase.from('trip_budget_items').update(payload).eq('id', item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('trip_budget_items').insert(payload);
    if (error) throw error;
  }
}

export async function deleteBudgetItem(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_budget_items').delete().eq('id', id);
  if (error) throw error;
}

// ── Sprint 3C: Reservations Tracker ──────────────────

export async function loadTripReservations(tripId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('trip_reservations').select('*')
    .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId)
    .order('res_date', { ascending: true, nullsFirst: false });
  if (error) console.error(error);
  return data || [];
}

export async function saveReservation(res) {
  if (!isSupabaseConfigured) return;
  const payload = { ...res, household_id: HOUSEHOLD_ID, updated_at: new Date().toISOString() };
  if (res.id) {
    const { error } = await supabase.from('trip_reservations').update(payload).eq('id', res.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('trip_reservations').insert(payload);
    if (error) throw error;
  }
}

export async function deleteReservation(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_reservations').delete().eq('id', id);
  if (error) throw error;
}

// ── Sprint 4A: Trip Photo Uploads ─────────────────────

export async function loadTripPhotos(tripId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('trip_photos').select('*')
    .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId)
    .order('created_at');
  if (error) console.error(error);
  return data || [];
}

export async function uploadTripPhoto({ tripId, file, caption, isCover, userId }) {
  if (!isSupabaseConfigured) return;

  const ext = file.name.split('.').pop();
  const path = `${HOUSEHOLD_ID}/${tripId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('trip-photos')
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('trip-photos')
    .getPublicUrl(path);

  // If setting as cover, unset any existing cover first
  if (isCover) {
    await supabase.from('trip_photos')
      .update({ is_cover: false })
      .eq('household_id', HOUSEHOLD_ID)
      .eq('trip_id', tripId);
  }

  const { error: dbError } = await supabase.from('trip_photos').insert({
    household_id: HOUSEHOLD_ID,
    trip_id: tripId,
    storage_path: path,
    url: urlData.publicUrl,
    caption: caption || '',
    is_cover: !!isCover,
    uploaded_by: userId || null,
  });

  if (dbError) throw dbError;
  return urlData.publicUrl;
}

export async function setPhotoAsCover(photoId, tripId) {
  if (!isSupabaseConfigured) return;
  // Unset all covers for this trip
  await supabase.from('trip_photos')
    .update({ is_cover: false })
    .eq('household_id', HOUSEHOLD_ID)
    .eq('trip_id', tripId);
  // Set new cover
  const { error } = await supabase.from('trip_photos')
    .update({ is_cover: true })
    .eq('id', photoId);
  if (error) throw error;
}

export async function deleteTripPhoto(photo) {
  if (!isSupabaseConfigured) return;
  // Delete from storage
  await supabase.storage.from('trip-photos').remove([photo.storage_path]);
  // Delete from db
  const { error } = await supabase.from('trip_photos').delete().eq('id', photo.id);
  if (error) throw error;
}

export async function updatePhotoCaption(photoId, caption) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_photos')
    .update({ caption })
    .eq('id', photoId);
  if (error) throw error;
}

// Load all cover photos for the household (for trip cards)
export async function loadAllCoverPhotos() {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase
    .from('trip_photos')
    .select('trip_id, url')
    .eq('household_id', HOUSEHOLD_ID)
    .eq('is_cover', true);
  if (error) console.error(error);
  const map = {};
  (data || []).forEach(p => { map[p.trip_id] = p.url; });
  return map;
}

// ── Sprint 4B: Post-Trip Journal ──────────────────────

export async function loadTripJournal(tripId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('trip_journal').select('*')
    .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId)
    .order('entry_date', { ascending: true });
  if (error) console.error(error);
  return data || [];
}

export async function saveJournalEntry(entry) {
  if (!isSupabaseConfigured) return;
  const session = await getSession();
  const payload = {
    ...entry,
    household_id: HOUSEHOLD_ID,
    authored_by: session?.user?.id || null,
    updated_at: new Date().toISOString(),
  };
  if (entry.id) {
    const { error } = await supabase.from('trip_journal').update(payload).eq('id', entry.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('trip_journal').insert(payload);
    if (error) throw error;
  }
}

export async function deleteJournalEntry(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('trip_journal').delete().eq('id', id);
  if (error) throw error;
}

// ── Sprint 4C: Trips Taken Timeline ──────────────────

export async function loadJournalCounts() {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase
    .from('trip_journal')
    .select('trip_id')
    .eq('household_id', HOUSEHOLD_ID);
  if (error) console.error(error);
  const counts = {};
  (data || []).forEach(row => {
    counts[row.trip_id] = (counts[row.trip_id] || 0) + 1;
  });
  return counts;
}

// ── PDF Import Job Polling ────────────────────────────

export async function pollPdfImportJob(jobId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('pdf_import_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

// ── Receipt Scan Job Polling ──────────────────────────

export async function pollReceiptScanJob(jobId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('receipt_scan_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

// ── Delete / Archive Trip ─────────────────────────────

// Fully deletes a custom trip and all its related data permanently.
export async function deleteCustomTrip(tripId) {
  if (!isSupabaseConfigured) return;

  // Delete all related rows across every table tied to this trip
  const tables = [
    'shared_trip_data', 'personal_trip_data', 'trip_votes',
    'trip_hotels', 'trip_restaurants', 'trip_budget', 'trip_budget_items',
    'trip_reservations', 'trip_photos', 'trip_journal',
    'pdf_import_jobs', 'receipt_scan_jobs',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete()
      .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId);
    if (error) console.error(`Error deleting from ${table}:`, error);
  }

  // Delete trip photos from storage
  try {
    const { data: photos } = await supabase
      .from('trip_photos').select('storage_path')
      .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId);
    if (photos?.length) {
      await supabase.storage.from('trip-photos').remove(photos.map(p => p.storage_path));
    }
  } catch (e) { console.error('Error cleaning up photos:', e); }

  // Finally delete the custom trip definition itself
  const { error } = await supabase.from('custom_trips_v3').delete()
    .eq('household_id', HOUSEHOLD_ID)
    .filter('trip->>id', 'eq', tripId);
  if (error) console.error('Error deleting custom trip:', error);
}

// Archives a built-in trip — hides it from view but keeps all data intact.
export async function archiveTrip(tripId) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('archived_trips').upsert({
    household_id: HOUSEHOLD_ID,
    trip_id: tripId,
  }, { onConflict: 'trip_id' });
  if (error) throw error;
}

export async function unarchiveTrip(tripId) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('archived_trips')
    .delete().eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId);
  if (error) throw error;
}

export async function loadArchivedTrips() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('archived_trips').select('trip_id')
    .eq('household_id', HOUSEHOLD_ID);
  if (error) { console.error(error); return []; }
  return (data || []).map(r => r.trip_id);
}

// ── Merge Trips ────────────────────────────────────────

// Merges sourceTripId INTO targetTripId. All hotels, restaurants, budget items,
// reservations, photos, and journal entries from source move to target.
// Shared notes/personal data from source are appended to target's if target's are empty,
// or kept as target's if target already has data (target wins on conflicts).
// Source trip is then deleted (if custom) or archived (if built-in).
export async function mergeTrips(sourceTripId, targetTripId, sourceIsCustom) {
  if (!isSupabaseConfigured) return;

  // Move child rows from source to target across every related table
  const tables = [
    'trip_hotels', 'trip_restaurants', 'trip_budget_items',
    'trip_reservations', 'trip_photos', 'trip_journal', 'trip_votes',
  ];
  for (const table of tables) {
    const { error } = await supabase.from(table)
      .update({ trip_id: targetTripId })
      .eq('household_id', HOUSEHOLD_ID)
      .eq('trip_id', sourceTripId);
    if (error) console.error(`Error moving ${table}:`, error);
  }

  // Merge shared_trip_data text fields — append source's content to target's
  const { data: sourceShared } = await supabase.from('shared_trip_data')
    .select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', sourceTripId).maybeSingle();
  const { data: targetShared } = await supabase.from('shared_trip_data')
    .select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', targetTripId).maybeSingle();

  if (sourceShared) {
    const mergeField = (key) => {
      const s = sourceShared[key] || '';
      const t = targetShared?.[key] || '';
      if (!s) return t;
      if (!t) return s;
      return `${t}\n\n--- Merged from other trip ---\n${s}`;
    };

    const mergedPayload = {
      household_id: HOUSEHOLD_ID,
      trip_id: targetTripId,
      status: targetShared?.status || sourceShared.status || 'Idea',
      shared_notes: mergeField('shared_notes'),
      ideas: mergeField('ideas'),
      restaurant_notes: mergeField('restaurant_notes'),
      memories: mergeField('memories'),
      packing: mergeField('packing'),
      budget_notes: mergeField('budget_notes'),
      itinerary_notes: mergeField('itinerary_notes'),
      hotel_notes: mergeField('hotel_notes'),
      flight_notes: mergeField('flight_notes'),
      reservation_notes: mergeField('reservation_notes'),
      map_notes: mergeField('map_notes'),
      document_notes: mergeField('document_notes'),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('shared_trip_data')
      .upsert(mergedPayload, { onConflict: 'household_id,trip_id' });
    if (error) console.error('Error merging shared data:', error);
  }

  // Merge personal_trip_data per user — keep target's row, but carry over wish_list flag if source had it
  const { data: sourcePersonalRows } = await supabase.from('personal_trip_data')
    .select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', sourceTripId);

  for (const row of sourcePersonalRows || []) {
    const { data: targetRow } = await supabase.from('personal_trip_data')
      .select('*').eq('household_id', HOUSEHOLD_ID).eq('trip_id', targetTripId).eq('user_id', row.user_id).maybeSingle();

    const merged = {
      household_id: HOUSEHOLD_ID,
      user_id: row.user_id,
      trip_id: targetTripId,
      favorite: targetRow?.favorite || row.favorite,
      want_to_visit: targetRow?.want_to_visit || row.want_to_visit,
      wish_list: targetRow?.wish_list || row.wish_list,
      wish_rank: targetRow?.wish_rank || row.wish_rank,
      personal_rating: targetRow?.personal_rating || row.personal_rating,
      personal_notes: [targetRow?.personal_notes, row.personal_notes].filter(Boolean).join('\n\n'),
      dream_reason: [targetRow?.dream_reason, row.dream_reason].filter(Boolean).join('\n\n'),
      must_do: [targetRow?.must_do, row.must_do].filter(Boolean).join('\n\n'),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('personal_trip_data')
      .upsert(merged, { onConflict: 'household_id,user_id,trip_id' });
    if (error) console.error('Error merging personal data:', error);
  }

  // Clean up source's now-empty shared/personal rows
  await supabase.from('shared_trip_data').delete().eq('household_id', HOUSEHOLD_ID).eq('trip_id', sourceTripId);
  await supabase.from('personal_trip_data').delete().eq('household_id', HOUSEHOLD_ID).eq('trip_id', sourceTripId);

  // Remove the source trip itself
  if (sourceIsCustom) {
    const { error } = await supabase.from('custom_trips_v3').delete()
      .eq('household_id', HOUSEHOLD_ID)
      .filter('trip->>id', 'eq', sourceTripId);
    if (error) console.error('Error deleting merged source trip:', error);
  } else {
    await supabase.from('archived_trips').upsert({
      household_id: HOUSEHOLD_ID,
      trip_id: sourceTripId,
    }, { onConflict: 'trip_id' });
  }
}

// ── Unsplash Destination Photos ───────────────────────

export async function loadPhotoCache() {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase
    .from('destination_photo_cache')
    .select('trip_id, photo_url');
  if (error) { console.error(error); return {}; }
  const map = {};
  (data || []).forEach(row => { map[row.trip_id] = row.photo_url; });
  return map;
}

export async function fetchAndCacheDestinationPhoto(tripId, searchQuery) {
  if (!isSupabaseConfigured) return null;
  try {
    const res = await fetch(`/.netlify/functions/unsplash-photo?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    if (!data.url) return null;

    await supabase.from('destination_photo_cache').upsert({
      trip_id: tripId,
      photo_url: data.url,
      credit_name: data.credit || '',
      credit_url: data.creditUrl || '',
      cached_at: new Date().toISOString(),
    }, { onConflict: 'trip_id' });

    return data.url;
  } catch (e) {
    console.error('Error fetching Unsplash photo for', tripId, e);
    return null;
  }
}

// ── Skylight Frame Integration ────────────────────────

export async function loadSkylightFrames() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('skylight_frames').select('*')
    .eq('household_id', HOUSEHOLD_ID).order('created_at');
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function saveSkylightFrame(frame) {
  if (!isSupabaseConfigured) return;
  const payload = { ...frame, household_id: HOUSEHOLD_ID };
  if (frame.id) {
    const { error } = await supabase.from('skylight_frames').update(payload).eq('id', frame.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('skylight_frames').insert(payload);
    if (error) throw error;
  }
}

export async function deleteSkylightFrame(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('skylight_frames').delete().eq('id', id);
  if (error) throw error;
}

export async function sendPhotoToFrames(frameEmails, photoUrl, caption, tripTitle) {
  const res = await fetch('/.netlify/functions/send-to-frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frameEmails, photoUrl, caption, tripTitle }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.results;
}

// ── Master Spending Dashboard ─────────────────────────

export async function loadAllBudgetItems() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('trip_budget_items')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID);
  if (error) { console.error(error); return []; }
  return data || [];
}

// ── Structured Itinerary Builder ──────────────────────

export async function loadItinerary(tripId) {
  if (!isSupabaseConfigured) return { days: [], stopsByDay: {} };
  const { data: days, error: dayErr } = await supabase
    .from('itinerary_days').select('*')
    .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId)
    .order('day_number');
  if (dayErr) console.error(dayErr);

  const { data: stops, error: stopErr } = await supabase
    .from('itinerary_stops').select('*')
    .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId)
    .order('sort_order');
  if (stopErr) console.error(stopErr);

  const stopsByDay = {};
  (stops || []).forEach(s => {
    if (!stopsByDay[s.day_id]) stopsByDay[s.day_id] = [];
    stopsByDay[s.day_id].push(s);
  });

  return { days: days || [], stopsByDay };
}

export async function setItineraryDayCount(tripId, count) {
  if (!isSupabaseConfigured) return;
  const { data: existing } = await supabase
    .from('itinerary_days').select('day_number')
    .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId);

  const existingNumbers = new Set((existing || []).map(d => d.day_number));

  // Add missing days
  const toAdd = [];
  for (let i = 1; i <= count; i++) {
    if (!existingNumbers.has(i)) {
      toAdd.push({ household_id: HOUSEHOLD_ID, trip_id: tripId, day_number: i, title: `Day ${i}`, sort_order: i });
    }
  }
  if (toAdd.length) {
    const { error } = await supabase.from('itinerary_days').insert(toAdd);
    if (error) throw error;
  }

  // Remove days beyond the new count (cascades to stops automatically)
  const { error: delError } = await supabase.from('itinerary_days')
    .delete().eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId).gt('day_number', count);
  if (delError) console.error(delError);
}

export async function updateItineraryDay(dayId, patch) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('itinerary_days').update(patch).eq('id', dayId);
  if (error) throw error;
}

export async function saveItineraryStop(stop) {
  if (!isSupabaseConfigured) return;
  const payload = { ...stop, household_id: HOUSEHOLD_ID, updated_at: new Date().toISOString() };
  if (stop.id) {
    const { error } = await supabase.from('itinerary_stops').update(payload).eq('id', stop.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('itinerary_stops').insert(payload);
    if (error) throw error;
  }
}

export async function deleteItineraryStop(id) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('itinerary_stops').delete().eq('id', id);
  if (error) throw error;
}

// Sync all itinerary stop costs into the trip's budget as a single "Itinerary" line item per day
export async function syncItineraryToBudget(tripId, days, stopsByDay) {
  if (!isSupabaseConfigured) return;

  for (const day of days) {
    const stops = stopsByDay[day.id] || [];
    const dayTotal = stops.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);

    // Find existing budget item for this day (tagged via notes marker)
    const marker = `[itinerary-day-${day.day_number}]`;
    const { data: existing } = await supabase
      .from('trip_budget_items').select('*')
      .eq('household_id', HOUSEHOLD_ID).eq('trip_id', tripId)
      .ilike('notes', `%${marker}%`)
      .maybeSingle();

    if (dayTotal === 0) {
      // Remove the line item if no stops have cost
      if (existing) {
        await supabase.from('trip_budget_items').delete().eq('id', existing.id);
      }
      continue;
    }

    const payload = {
      household_id: HOUSEHOLD_ID,
      trip_id: tripId,
      category: 'Activities',
      label: `${day.title || `Day ${day.day_number}`} — Itinerary`,
      estimated: dayTotal,
      actual: existing?.actual ?? null,
      notes: marker,
      sort_order: 500 + day.day_number,
    };

    if (existing) {
      await supabase.from('trip_budget_items').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('trip_budget_items').insert(payload);
    }
  }
}
