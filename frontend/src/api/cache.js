/**
 * Lightweight in-memory cache for API responses.
 * - First call: fetches from API, caches result
 * - Subsequent calls: returns cache instantly (no spinner)
 * - Cache expires after TTL (default 5 min), then refreshes silently in background
 */

const store = new Map(); // key -> { data, expiresAt }
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * cachedGet(apiFn, key, ttl?)
 * @param {Function} apiFn  - async function that returns data (e.g. () => api.get('/settings').then(r=>r.data))
 * @param {string}   key    - unique cache key
 * @param {number}   ttl    - milliseconds before background refresh (default 5 min)
 * @returns {{ data, loading }} - data is the cached/fetched value, loading is true only on cold first fetch
 */
export async function cachedGet(apiFn, key, ttl = DEFAULT_TTL) {
    const now = Date.now();
    const hit = store.get(key);

    if (hit) {
        // Stale-while-revalidate: if expired, refresh in background but return cached data instantly
        if (now > hit.expiresAt) {
            apiFn().then(data => store.set(key, { data, expiresAt: Date.now() + ttl })).catch(() => { });
        }
        return hit.data; // instant return
    }

    // Cold fetch
    const data = await apiFn();
    store.set(key, { data, expiresAt: now + ttl });
    return data;
}

/** Manually invalidate a cache key (e.g., after admin saves something) */
export function invalidateCache(key) {
    store.delete(key);
}

/** Invalidate all cache keys matching a prefix */
export function invalidateCachePrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/** Preload a set of keys in parallel (call on app start for instant first loads) */
export function preload(keys) {
    keys.forEach(({ apiFn, key, ttl }) => {
        if (!store.has(key)) {
            apiFn().then(data => store.set(key, { data, expiresAt: Date.now() + (ttl || DEFAULT_TTL) })).catch(() => { });
        }
    });
}
