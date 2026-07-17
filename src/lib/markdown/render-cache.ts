import { env } from 'cloudflare:workers'
import { sha256Hex } from './hash.ts'
import type { SerializedMarkdown } from './render.ts'

/**
 * Bump whenever a pipeline or plugin change alters render output — old
 * entries are then never read again and expire via TTL, so no purge
 * logic is needed.
 */
const PIPELINE_VERSION = 1

const TTL_SECONDS = 86_400

/**
 * KV cache for finished renders: KV is global, so one render performed
 * anywhere serves every region for a day. Keyed by content hash; only
 * url-sourced renders are cached (see render.ts) so the key space stays
 * limited to trusted origins. Everything here is best-effort: a missing
 * binding or a KV failure is a cache miss, never a broken render.
 */
export const renderCacheKey = async (content: string): Promise<string> =>
  `md:v${PIPELINE_VERSION}:${await sha256Hex(content)}`

export const getCachedRender = async (
  key: string,
): Promise<SerializedMarkdown | null> => {
  try {
    const hit = (await env.PLANET_CACHE?.get(key, 'json')) as
      | SerializedMarkdown
      | null
      | undefined
    // Guards a forgotten PIPELINE_VERSION bump: an old-shape entry
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
