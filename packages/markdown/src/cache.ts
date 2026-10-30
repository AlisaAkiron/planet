/**
 * Key-value storage the renderer persists fetched link-card metadata and
 * highlighted code into. Apps supply it — Workers KV on the site, an
 * in-memory map in the preview server; without one, every render fetches
 * and highlights from scratch. Implementations may throw: every call goes
 * through the helpers below, which turn a failure into a miss, because
 * caching is always best-effort and must never break a render.
 */
export interface MarkdownCache {
  get: (key: string) => Promise<string | null>
  /** Bulk read of the keys that exist. Optional; falls back to get(). */
  getMany?: (keys: string[]) => Promise<Map<string, string>>
  put: (key: string, value: string, ttlSeconds: number) => Promise<void>
}

export const cacheGet = async (
  cache: MarkdownCache,
  key: string,
): Promise<string | null> => {
  try {
    return await cache.get(key)
  } catch {
    return null
  }
}

export const cacheGetMany = async (
  cache: MarkdownCache,
  keys: string[],
): Promise<Map<string, string>> => {
  try {
    if (cache.getMany) return await cache.getMany(keys)
    const found = new Map<string, string>()
    const values = await Promise.all(keys.map(key => cacheGet(cache, key)))
    keys.forEach((key, i) => {
      const value = values[i]
      if (value !== null) found.set(key, value)
    })
    return found
  } catch {
    return new Map()
  }
}

export const cachePut = async (
  cache: MarkdownCache,
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> => {
  try {
    await cache.put(key, value, ttlSeconds)
  } catch {
    // cache write is best-effort
  }
}
