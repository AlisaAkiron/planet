import { cacheGet, cachePut } from './cache.ts'
import { cacheKeyHash } from './hash.ts'
import type { MarkdownCache } from './cache.ts'

/**
 * Bump whenever the stored shape changes — old entries are then never
 * read again and expire via TTL, so no purge logic is needed.
 */
const FETCH_CACHE_VERSION = 1

const DEFAULT_TTL = 86_400
const MAX_TEXT_CHARS = 500_000
const TIMEOUT_MS = 5000

/**
 * Prefix of the entry stored in place of a body when failureTtl is set,
 * followed by the failure as JSON. A NUL byte can't start a real body that
 * matters here: every fetched document is JSON or HTML text.
 */
const FAILED_MARKER = '\u0000failed'

/** Some metadata hosts reject requests without a User-Agent. */
export const UA_HEADER = { 'User-Agent': 'planet-markdown-renderer' }

export type CachedFetchInit = RequestInit & { ttl?: number }

/**
 * Why a metadata fetch produced nothing:
 * - network: no response at all. In a browser this is almost always CORS
 *   (the host doesn't allow cross-origin reads), which fetch can't tell
 *   apart from a network error.
 * - timeout: no response within the time limit.
 * - rate-limited: the host refused for request volume (429, or GitHub's
 *   403 with no requests remaining). `resetAt` is when it lifts, if known.
 * - http: any other non-2xx status.
 * - invalid: a response arrived but wasn't the expected JSON.
 */
export type FetchFailureReason =
  | 'network'
  | 'timeout'
  | 'rate-limited'
  | 'http'
  | 'invalid'

export interface FetchFailure {
  url: string
  reason: FetchFailureReason
  status?: number
  /** Epoch milliseconds when a rate limit lifts. */
  resetAt?: number
}

type Outcome = { body: string } | { failure: Omit<FetchFailure, 'url'> }

export interface FetchOptions {
  cache?: MarkdownCache
  /**
   * Seconds a failed fetch is remembered, so renders in that window skip
   * it instead of refetching. Off by default: the site re-renders rarely
   * and would rather retry. The preview re-renders on every edit, where
   * retrying a rate-limited API each time only digs the hole deeper.
   */
  failureTtl?: number
  /**
   * The network call, defaulting to the global fetch. Lets a host adapt
   * requests to its runtime — a browser dropping headers that would force
   * a CORS preflight, or an editor routing them through its own
   * CORS-free request API.
   */
  fetch?: typeof fetch
}

export interface Fetcher {
  text: (url: string, init?: CachedFetchInit) => Promise<string | null>
  json: <T>(url: string, init?: CachedFetchInit) => Promise<T | null>
}

// URLs are hashed rather than used verbatim: KV keys max out at 512 bytes
// and raw file paths can exceed that.
const cacheKey = async (url: string) =>
  `fetch:v${FETCH_CACHE_VERSION}:${await cacheKeyHash(url)}`

const readFailureMarker = (entry: string): Outcome => {
  try {
    const failure = JSON.parse(entry.slice(FAILED_MARKER.length)) as Omit<
      FetchFailure,
      'url'
    >
    if (typeof failure.reason === 'string') return { failure }
  } catch {
    // unreadable marker: report it as the most generic failure
  }
  return { failure: { reason: 'network' } }
}

const failureOf = (response: Response): Omit<FetchFailure, 'url'> => {
  const { status, headers } = response
  // GitHub signals exhaustion with 403 + x-ratelimit-remaining: 0 (and
  // exposes these headers to cross-origin readers); 429 is the standard.
  const exhausted = headers.get('x-ratelimit-remaining') === '0'
  if (status === 429 || (status === 403 && exhausted)) {
    const reset = Number(headers.get('x-ratelimit-reset'))
    const retryAfter = Number(headers.get('retry-after'))
    const resetAt =
      reset > 0
        ? reset * 1000
        : retryAfter > 0
          ? Date.now() + retryAfter * 1000
          : undefined
    return { reason: 'rate-limited', status, resetAt }
  }
  return { reason: 'http', status }
}

/**
 * Fetch through the cache with a hard timeout. Never throws — link-card
 * metadata is always optional decoration, so failures must never break
 * rendering — but says why it failed, for hosts that show it.
 *
 * On the site the cache is global KV, so one successful fetch serves every
 * region until its TTL expires — a degraded render's retry refetches only
 * what actually failed. Failures are cached only when failureTtl asks for
 * it. Redirects are followed manually, one hop, and only to the same https
 * host — GitHub's API 301s renamed/transferred repos to canonical URLs, but
 * a metadata host must never be able to pivot the fetch elsewhere.
 */
const cachedFetch = async (
  url: string,
  init: CachedFetchInit | undefined,
  { cache, failureTtl, fetch: fetchImpl = fetch }: FetchOptions,
): Promise<Outcome> => {
  const key = await cacheKey(url)
  if (cache) {
    const hit = await cacheGet(cache, key)
    if (hit?.startsWith(FAILED_MARKER)) return readFailureMarker(hit)
    if (hit !== null) return { body: hit }
  }

  const fetchOnce = (target: string) =>
    fetchImpl(target, {
      ...init,
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

  const sameHostRedirect = (from: string, response: Response) => {
    const location = response.headers.get('location')
    if (!location) return null
    try {
      const target = new URL(location, from)
      return target.protocol === 'https:' &&
        target.hostname === new URL(from).hostname
        ? target.href
        : null
    } catch {
      return null
    }
  }

  const outcome = await (async (): Promise<Outcome> => {
    try {
      let response = await fetchOnce(url)
      if (response.status >= 300 && response.status < 400) {
        const target = sameHostRedirect(url, response)
        if (target) response = await fetchOnce(target)
      }
      if (!response.ok) return { failure: failureOf(response) }
      return { body: (await response.text()).slice(0, MAX_TEXT_CHARS) }
    } catch (error) {
      const timedOut =
        error instanceof DOMException && error.name === 'TimeoutError'
      return { failure: { reason: timedOut ? 'timeout' : 'network' } }
    }
  })()

  if (cache && 'body' in outcome) {
    await cachePut(cache, key, outcome.body, init?.ttl ?? DEFAULT_TTL)
  } else if (cache && failureTtl && 'failure' in outcome) {
    // A known rate-limit reset beats the fixed TTL in both directions.
    const ttl = outcome.failure.resetAt
      ? Math.max(1, Math.ceil((outcome.failure.resetAt - Date.now()) / 1000))
      : failureTtl
    await cachePut(
      cache,
      key,
      FAILED_MARKER + JSON.stringify(outcome.failure),
      ttl,
    )
  }
  return outcome
}

/**
 * Concurrent requests for the same URL share one fetch — link-card jobs run
 * in parallel, so duplicates would all miss the cache and all refetch
 * (Workers caps subrequests per request). Scoped per cache so renders with
 * different caches never share results; later callers inherit the first
 * caller's init.
 */
const NO_CACHE = {}
const inFlightByCache = new WeakMap<object, Map<string, Promise<Outcome>>>()

/**
 * A fetcher reporting every failed or skipped fetch to `onFailure`, so a
 * render can tell a degraded result from a legitimately empty one (a
 * tombstoned tweet, an av-form Bilibili link) — and say why.
 */
export const createFetcher = (
  options: FetchOptions,
  onFailure: (failure: FetchFailure) => void,
): Fetcher => {
  const scope = options.cache ?? NO_CACHE
  let inFlight = inFlightByCache.get(scope)
  if (!inFlight) {
    inFlight = new Map()
    inFlightByCache.set(scope, inFlight)
  }
  const pending = inFlight

  const text = async (url: string, init?: CachedFetchInit) => {
    let shared = pending.get(url)
    if (!shared) {
      shared = cachedFetch(url, init, options).finally(() =>
        pending.delete(url),
      )
      pending.set(url, shared)
    }
    // Failure is reported per caller rather than inside the shared fetch,
    // so a caller that joins another render's in-flight fetch still marks
    // its own render as degraded.
    const outcome = await shared
    if ('body' in outcome) return outcome.body
    onFailure({ url, ...outcome.failure })
    return null
  }

  const json = async <T>(url: string, init?: CachedFetchInit) => {
    const body = await text(url, init)
    if (body === null) return null
    try {
      return JSON.parse(body) as T
    } catch {
      onFailure({ url, reason: 'invalid' })
      return null
    }
  }

  return { text, json }
}
