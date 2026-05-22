/** Force HTTPS for media URLs (API sometimes returns http://). */
export function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/^http:\/\//i, 'https://');
}

/** Map production API fields to what the UI expects. */
export function normalizeSound(s) {
  if (!s || typeof s !== 'object') return s;
  return {
    ...s,
    original_name: s.original_name ?? s.name ?? s.filename ?? 'Sound',
    url: normalizeMediaUrl(s.url),
  };
}

export function normalizeSounds(list) {
  return (Array.isArray(list) ? list : []).map(normalizeSound);
}
