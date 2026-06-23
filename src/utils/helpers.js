
export const img = (query) =>
  `https://source.unsplash.com/featured/1400x900/?${encodeURIComponent(`${query}, travel landmark`)}`;

export const mapUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const getLocal = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export const setLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const money = (value) =>
  Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
