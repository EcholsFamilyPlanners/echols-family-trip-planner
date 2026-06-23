
import { getLocal, setLocal } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_TRIP_DATA_KEY = 'travelPlannerV22_tripData';
const LOCAL_CUSTOM_TRIPS_KEY = 'travelPlannerV22_customTrips';
const LOCAL_IDEA_INBOX_KEY = 'travelPlannerV22_ideaInbox';

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(email) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

const fromDbRow = (row) => ({
  status: row.status || undefined,
  favorite: !!row.favorite,
  ideas: row.ideas || '',
  restaurantNotes: row.restaurant_notes || '',
  memories: row.memories || '',
  packing: row.packing || '',
  notes: row.general_notes || '',
});

const toDbPatch = (patch) => ({
  status: patch.status,
  favorite: patch.favorite,
  ideas: patch.ideas,
  restaurant_notes: patch.restaurantNotes,
  memories: patch.memories,
  packing: patch.packing,
  general_notes: patch.notes,
});

export async function loadTripData() {
  if (!isSupabaseConfigured) return getLocal(LOCAL_TRIP_DATA_KEY, {});
  const { data, error } = await supabase.from('shared_trip_data').select('*');
  if (error) {
    console.error(error);
    return getLocal(LOCAL_TRIP_DATA_KEY, {});
  }
  const result = {};
  for (const row of data || []) result[row.trip_id] = fromDbRow(row);
  setLocal(LOCAL_TRIP_DATA_KEY, result);
  return result;
}

export async function saveTripPatch(tripId, patch, current) {
  const next = { ...(current || {}), ...patch };

  if (!isSupabaseConfigured) {
    const all = getLocal(LOCAL_TRIP_DATA_KEY, {});
    all[tripId] = next;
    setLocal(LOCAL_TRIP_DATA_KEY, all);
    return next;
  }

  const session = await getSession();
  const payload = {
    trip_id: tripId,
    ...toDbPatch(next),
    updated_by: session?.user?.id || null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('shared_trip_data')
    .upsert(payload, { onConflict: 'trip_id' });

  if (error) throw error;
  return next;
}

export async function loadCustomTrips() {
  if (!isSupabaseConfigured) return getLocal(LOCAL_CUSTOM_TRIPS_KEY, []);
  const { data, error } = await supabase.from('shared_custom_trips').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error(error);
    return getLocal(LOCAL_CUSTOM_TRIPS_KEY, []);
  }
  return (data || []).map(row => row.trip);
}

export async function saveCustomTrip(trip) {
  if (!isSupabaseConfigured) {
    const current = getLocal(LOCAL_CUSTOM_TRIPS_KEY, []);
    const next = [...current, trip];
    setLocal(LOCAL_CUSTOM_TRIPS_KEY, next);
    return next;
  }

  const session = await getSession();
  const { error } = await supabase.from('shared_custom_trips').insert({
    trip,
    created_by: session?.user?.id || null
  });

  if (error) throw error;
}

export function loadIdeaInbox() {
  return localStorage.getItem(LOCAL_IDEA_INBOX_KEY) || '';
}

export function saveIdeaInbox(value) {
  localStorage.setItem(LOCAL_IDEA_INBOX_KEY, value);
}

export function exportPlannerData({ tripData, customTrips, ideaInbox }) {
  const blob = new Blob([JSON.stringify({
    app: 'Anthony & Stephanie Travel Planner',
    version: '2.2',
    tripData,
    customTrips,
    ideaInbox,
    exportedAt: new Date().toISOString()
  }, null, 2)], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'anthony-stephanie-travel-planner-v2-2-data.json';
  link.click();
}

export async function syncImportData({ tripData, customTrips, ideaInbox }) {
  if (ideaInbox !== undefined) saveIdeaInbox(ideaInbox);

  if (!isSupabaseConfigured) {
    if (tripData) setLocal(LOCAL_TRIP_DATA_KEY, tripData);
    if (customTrips) setLocal(LOCAL_CUSTOM_TRIPS_KEY, customTrips);
    return;
  }

  if (tripData) {
    for (const [tripId, value] of Object.entries(tripData)) {
      await saveTripPatch(tripId, value, {});
    }
  }

  if (customTrips) {
    for (const trip of customTrips) {
      await saveCustomTrip(trip);
    }
  }
}
