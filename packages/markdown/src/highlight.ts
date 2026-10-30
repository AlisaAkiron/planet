import { cacheGetMany, cachePut } from './cache.ts'
import { cacheKeyHash } from './hash.ts'
import { highlightToHtml, resolveLang } from './shiki.ts'
import type { MarkdownCache } from './cache.ts'

/**
 * Bump whenever highlight output changes for the same input: a theme
 * swap, a shiki major, a grammar change worth re-rendering for. Old
 * entries are then never read again and expire via TTL.
 */
const HIGHLIGHT_CACHE_VERSION = 1

// Highlighting is deterministic, so unlike link-card metadata there is no
// freshness to protect — the TTL only bounds storage.
const TTL_SECONDS = 30 * 86_400

export interface HighlightRequest {
  code: string
  lang: string
}

/**
 * Cache of highlighted code blocks, keyed by (grammar, source). A
 * whole-document render cache is keyed by content hash, so editing one
 * paragraph of a post — or the daily expiry of its render — re-runs the
 * pipeline; with this layer that re-run skips shiki entirely, which is
 * where nearly all of a cold render's CPU goes (grammar regex compilation
 * on a fresh isolate). In the preview server it keeps unchanged blocks
 * from being re-highlighted on every edit.
 */
const cacheKey = async ({ code, lang }: HighlightRequest) =>
  `hl:v${HIGHLIGHT_CACHE_VERSION}:${await cacheKeyHash(`${resolveLang(lang)}\0${code}`)}`

/**
 * Highlights every block, serving repeats from the cache in one bulk read
 * and persisting the misses. Results are in input order.
 */
export const highlightMany = async (
  requests: HighlightRequest[],
  cache?: MarkdownCache,
): Promise<string[]> => {
  if (requests.length === 0) return []
  if (!cache) {
    return Promise.all(requests.map(r => highlightToHtml(r.code, r.lang)))
  }
  const keys = await Promise.all(requests.map(cacheKey))
  const hits = await cacheGetMany(cache, [...new Set(keys)])
  return Promise.all(
    requests.map(async (request, i) => {
      const key = keys[i]
      const hit = hits.get(key)
      if (hit !== undefined) return hit
      const html = await highlightToHtml(request.code, request.lang)
      // Awaited: the Workers runtime may cancel pending work once the
      // response is returned.
      await cachePut(cache, key, html, TTL_SECONDS)
      return html
    }),
  )
}
