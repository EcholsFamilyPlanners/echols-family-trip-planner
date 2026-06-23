
/*
  V2.1 Sync Service

  Current mode:
  - Browser localStorage only.
  - This keeps the app working immediately on Netlify.

  Future mode:
  - Replace these functions with Supabase calls.
  - That will allow Anthony and Stephanie to share favorites, notes, visited status,
    trip journals, budgets, and custom trips across devices.
*/

import { getLocal, setLocal } from '../utils/helpers';

const TRIP_DATA_KEY = 'travelPlannerV21_tripData';
const CUSTOM_TRIPS_KEY = 'travelPlannerV21_customTrips';
const IDEA_INBOX_KEY = 'travelPlannerV21_ideaInbox';

export function loadTripData() {
  return getLocal(TRIP_DATA_KEY, {});
}

export function saveTripData(data) {
  setLocal(TRIP_DATA_KEY, data);
}

export function loadCustomTrips() {
  return getLocal(CUSTOM_TRIPS_KEY, []);
}

export function saveCustomTrips(trips) {
  setLocal(CUSTOM_TRIPS_KEY, trips);
}

export function loadIdeaInbox() {
  return localStorage.getItem(IDEA_INBOX_KEY) || '';
}

export function saveIdeaInbox(value) {
  localStorage.setItem(IDEA_INBOX_KEY, value);
}

export function exportPlannerData({ tripData, customTrips, ideaInbox }) {
  const blob = new Blob([JSON.stringify({
    app: 'Anthony & Stephanie Travel Planner',
    version: '2.1',
    tripData,
    customTrips,
    ideaInbox,
    exportedAt: new Date().toISOString()
  }, null, 2)], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'anthony-stephanie-travel-planner-v2-1-data.json';
  link.click();
}
