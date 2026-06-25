
export const HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001';

// Generate a stable Picsum photo ID from a string (trip id or title)
function stablePhotoId(str) {
  let hash = 0;
  for (let c of String(str || '')) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return 100 + (Math.abs(hash) % 800);
}

// Returns a photo URL for a trip.
// If the trip has a custom photo saved to Supabase storage, use that.
// Otherwise fall back to a stable Picsum landscape photo.
export const img = (queryOrId, customPhotoUrl) => {
  if (customPhotoUrl) return customPhotoUrl;
  const pid = stablePhotoId(queryOrId);
  return `https://picsum.photos/id/${pid}/1400/900`;
};

export const mapUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const money = (value) =>
  Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const getLocal = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export const setLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));
