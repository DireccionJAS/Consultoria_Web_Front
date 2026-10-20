export const COOKIE_KEY = 'jas.cookie-preferences.v1';
export const COOKIE_EVENT = 'jas:cookie-preferences';
export const COOKIE_OPEN_EVENT = 'jas:open-cookie-preferences';
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;

export function readPreferences(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(COOKIE_KEY));
    if (value?.version !== 1 || typeof value.maps !== 'boolean' ||
        !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt >= MAX_AGE) return null;
    return value;
  } catch { return null; }
}

export function savePreferences(storage, maps, now = Date.now()) {
  const value = { version: 1, maps: Boolean(maps), savedAt: now };
  try { storage.setItem(COOKIE_KEY, JSON.stringify(value)); } catch { /* Session still works without storage. */ }
  return value;
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(COOKIE_OPEN_EVENT));
}
