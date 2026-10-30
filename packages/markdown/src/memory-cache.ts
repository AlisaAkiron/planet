import type { MarkdownCache } from './cache.ts'

interface Entry {
  value: string
  expires: number
}

/**
 * In-memory LRU cache for the renderer — for long-lived hosts without a
 * shared store, like the preview server or a browser tab. Bounded by total
 * stored characters rather than entry count — a highlighted file snippet
 * can be hundreds of times larger than a link card's JSON.
 */
export const createMemoryCache = (
  maxChars = 64 * 1024 * 1024,
): MarkdownCache => {
  // Map iteration order is insertion order, so re-inserting on access
  // keeps the least recently used entry first.
  const entries = new Map<string, Entry>()
  let size = 0

  const remove = (key: string) => {
    const entry = entries.get(key)
    if (!entry) return
    entries.delete(key)
    size -= entry.value.length
  }

  return {
    get: async key => {
      const entry = entries.get(key)
      if (!entry) return null
      remove(key)
      if (entry.expires <= Date.now()) return null
      entries.set(key, entry)
      size += entry.value.length
      return entry.value
    },
    put: async (key, value, ttlSeconds) => {
      remove(key)
      if (value.length > maxChars) return
      entries.set(key, { value, expires: Date.now() + ttlSeconds * 1000 })
      size += value.length
      for (const oldest of entries.keys()) {
        if (size <= maxChars) break
        remove(oldest)
      }
    },
  }
}
