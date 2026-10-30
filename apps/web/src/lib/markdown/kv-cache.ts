import { env } from 'cloudflare:workers'
import type { MarkdownCache } from '@planet/markdown'

// KV rejects expirationTtl below 60 seconds.
const MIN_KV_TTL = 60

// KV bulk get accepts at most this many keys per call.
const BULK_GET_LIMIT = 100

/**
 * The renderer's cache backed by the PLANET_CACHE KV namespace. KV is
 * global, so a fetch or highlight done in one region serves every other.
 * A missing binding (plain local dev) behaves as an always-empty cache;
 * the renderer already treats any thrown error as a miss.
 */
export const kvMarkdownCache: MarkdownCache = {
  get: async key => (await env.PLANET_CACHE?.get(key, 'text')) ?? null,
  getMany: async keys => {
    const found = new Map<string, string>()
    const kv = env.PLANET_CACHE
    if (!kv) return found
    const chunks: string[][] = []
    for (let i = 0; i < keys.length; i += BULK_GET_LIMIT) {
      chunks.push(keys.slice(i, i + BULK_GET_LIMIT))
    }
    await Promise.all(
      chunks.map(async chunk => {
        try {
          for (const [key, value] of await kv.get(chunk, 'text')) {
            if (value !== null) found.set(key, value)
          }
        } catch {
          // KV unavailable — treat the chunk as misses
        }
      }),
    )
    return found
  },
  put: async (key, value, ttlSeconds) => {
    await env.PLANET_CACHE?.put(key, value, {
      expirationTtl: Math.max(ttlSeconds, MIN_KV_TTL),
    })
  },
}
