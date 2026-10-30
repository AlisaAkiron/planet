import { env } from 'cloudflare:workers'
import { RENDER_VERSION, sha256Hex } from '@planet/markdown'
import type { SerializedMarkdown } from './render.ts'

const TTL_SECONDS = 86_400

/**
 * KV cache for finished renders: KV is global, so one render performed
 * anywhere serves every region for a day. Keyed by content hash and the
 * renderer's RENDER_VERSION; only same-origin and trusted documents are
 * ever rendered (see render.ts), so the key space stays bounded. Everything here is best-effort: a missing
 * binding or a KV failure is a cache miss, never a broken render.
 */
export const renderCacheKey = async (content: string): Promise<string> =>
  `md:v${RENDER_VERSION}:${await sha256Hex(content)}`

export const getCachedRender = async (
  key: string,
): Promise<SerializedMarkdown | null> => {
  try {
    const hit = (await env.PLANET_CACHE?.get(key, 'json')) as
      | SerializedMarkdown
      | null
      | undefined
    // Guards a forgotten RENDER_VERSION bump: an old-shape entry
    // becomes a miss instead of crashing MarkdownView.
    return hit && typeof hit.tree === 'string' ? hit : null
  } catch {
    return null
  }
}

export const putCachedRender = async (
  key: string,
  value: SerializedMarkdown,
): Promise<void> => {
  try {
    await env.PLANET_CACHE?.put(key, JSON.stringify(value), {
      expirationTtl: TTL_SECONDS,
    })
  } catch {
    // cache write is best-effort
  }
}
