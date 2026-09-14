import { env } from 'cloudflare:workers'
import { isPersistEnabled } from './fetch-cache.ts'
import { sha256Hex } from './hash.ts'
import { highlightToHtml, resolveLang } from './shiki.ts'

/**
 * Bump whenever highlight output changes for the same input: a theme
 * swap, a shiki major, a grammar change worth re-rendering for. Old
 * entries are then never read again and expire via TTL.
 */
const HIGHLIGHT_CACHE_VERSION = 1

// Highlighting is deterministic, so unlike link-card metadata there is no
// freshness to protect — the TTL only bounds storage.
const TTL_SECONDS = 30 * 86_400

// KV bulk get accepts at most this many keys per call.
const BULK_GET_LIMIT = 100

export interface HighlightRequest {
  code: string
  lang: string
}

/**
 * KV cache of highlighted code blocks, keyed by (grammar, source). The
 * whole-document render cache is keyed by content hash, so editing one
 * paragraph of a post — or the daily expiry of its render — re-runs the
 * pipeline; with this layer that re-run skips shiki entirely, which is
 * where nearly all of a cold render's CPU goes (grammar regex compilation
 * on a fresh isolate). Gated on the same trust decision as fetch-cache:
 * only url-sourced renders of trusted documents touch KV, so a public POST
 * body can neither mint writes nor fan out reads. Everything is
 * best-effort — any KV failure is a miss.
 */
const cacheKey = async ({ code, lang }: HighlightRequest) =>
  `hl:v${HIGHLIGHT_CACHE_VERSION}:${await sha256Hex(`${resolveLang(lang)}\0${code}`)}`

const readMany = async (keys: string[]): Promise<Map<string, string>> => {
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
}

const write = async (key: string, html: string) => {
  try {
    await env.PLANET_CACHE?.put(key, html, { expirationTtl: TTL_SECONDS })
  } catch {
    // cache write is best-effort
  }
}

/**
 * Highlights every block, serving repeats from KV in one bulk read and
 * persisting the misses. Results are in input order.
 */
export const highlightMany = async (
  requests: HighlightRequest[],
): Promise<string[]> => {
  if (requests.length === 0) return []
  if (!isPersistEnabled()) {
    return Promise.all(requests.map(r => highlightToHtml(r.code, r.lang)))
  }
  const keys = await Promise.all(requests.map(cacheKey))
  const hits = await readMany([...new Set(keys)])
  return Promise.all(
    requests.map(async (request, i) => {
      const key = keys[i]
      const hit = hits.get(key)
      if (hit !== undefined) return hit
      const html = await highlightToHtml(request.code, request.lang)
      // Awaited: the runtime may cancel pending work once the response
      // is returned.
      await write(key, html)
      return html
    }),
  )
}

export const highlightOne = async (
  code: string,
  lang: string,
): Promise<string> => (await highlightMany([{ code, lang }]))[0]
