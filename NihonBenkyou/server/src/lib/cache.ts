/**
 * Lightweight in-process TTL cache — avoids repeat DB hits for static seed data.
 * Cache is per-process; cleared on server restart (fine for read-only content).
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set(key: string, data: unknown, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }
}

export const cache = new TTLCache();

// Seed data never changes — 24 h per Railway deployment is safe.
export const TTL_STATIC = 24 * 60 * 60 * 1000;
// Lesson / quiz content is also static but use a shorter TTL as a safety net.
export const TTL_LONG = 60 * 60 * 1000; // 1 h
