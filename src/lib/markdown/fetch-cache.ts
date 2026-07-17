import { AsyncLocalStorage } from 'node:async_hooks'
import { env } from 'cloudflare:workers'
import { sha256Hex } from './hash.ts'

/**
 * Bump whenever the stored shape changes — old entries are then never
 * read again and expire via TTL, so no purge logic is needed.
 */
const FETCH_CACHE_VERSION = 1

const DEFAULT_TTL = 86_400
// KV rejects expirationTtl below 60 seconds.
const MIN_KV_TTL = 60
const MAX_TEXT_CHARS = 500_000

/** Some metadata hosts reject requests without a User-Agent. */
export const UA_HEADER = { 'User-Agent': 'planet-markdown-renderer' }

export type CachedFetchInit = RequestInit & { ttl?: number }

/**
 * Per-render fetch context. cachedFetch swallows every failure to null so
 * rendering never breaks, which makes a failed fetch indistinguishable from
 * a legitimately empty result (a tombstoned tweet, an av-form Bilibili
 * link). `failed` records that a fetch actually failed, so the caller can
 * decline to persist a degraded render. `persist` gates KV writes: fetched
 * bodies are stored only for renders of trusted documents — a bounded key
 * space — while raw content arrives from a public POST body, and letting it
 * mint KV writes would drain the daily write quota.
 */
interface FetchContext {
  failed: boolean
  persist: boolean
}

const fetchContext = new AsyncLocalStorage<FetchContext>()

const markFetchFailed = () => {
  const context = fetchContext.getStore()
  if (context) context.failed = true
}

/**
 * Runs `fn` while watching for cachedFetch failures inside it. Returns the
 * result alongside whether any fetch failed. `persist` additionally allows
 * successful fetch bodies to be written to KV. If the async context is ever
 * lost, `anyFailed` stays false and nothing persists — rendering still
 * works, caching degrades to a no-op.
 */
export const withFetchFailureTracking = async <T>(
  fn: () => Promise<T>,
  { persist = false }: { persist?: boolean } = {},
): Promise<{ result: T; anyFailed: boolean }> => {
  const context: FetchContext = { failed: false, persist }
  const result = await fetchContext.run(context, fn)
  return { result, anyFailed: context.failed }
}

// URLs are hashed rather than used verbatim: KV keys max out at 512 bytes
// and raw file paths can exceed that.
const cacheKey = async (url: string) =>
  `fetch:v${FETCH_CACHE_VERSION}:${await sha256Hex(url)}`

const readCached = async (key: string): Promise<string | null> => {
  try {
    return (await env.PLANET_CACHE?.get(key, 'text')) ?? null
  } catch {
    // KV unavailable — treat as a miss
    return null
  }
}

const writeCached = async (key: string, body: string, ttl: number) => {
  if (!fetchContext.getStore()?.persist) return
  try {
    await env.PLANET_CACHE?.put(key, body, {
      expirationTtl: Math.max(ttl, MIN_KV_TTL),
    })
  } catch {
    // cache write is best-effort
  }
}

/**
 * Fetch through KV with a hard timeout, returning the body text or null on
 * any failure — link-card metadata is always optional decoration, so
 * failures must never break rendering.
 *
 * KV is global, so one successful fetch serves every region until its TTL
 * expires — a degraded render's retry refetches only what actually failed.
 * Failures are never cached: the write quota is spent on successes only,
 * and the next render simply retries. Redirects are followed manually, one
 * hop, and only to the same https host — GitHub's API 301s
 * renamed/transferred repos to canonical URLs, but a metadata host must
 * never be able to pivot the fetch elsewhere.
 */
const cachedFetch = async (
  url: string,
  init?: CachedFetchInit,
): Promise<string | null> => {
  const key = await cacheKey(url)
  const hit = await readCached(key)
  if (hit !== null) return hit

  const fetchOnce = (target: string) =>
    fetch(target, {
      ...init,
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
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

  try {
    let response = await fetchOnce(url)
    if (response.status >= 300 && response.status < 400) {
      const target = sameHostRedirect(url, response)
      if (target) response = await fetchOnce(target)
    }
    if (!response.ok) return null
    const body = (await response.text()).slice(0, MAX_TEXT_CHARS)
    await writeCached(key, body, init?.ttl ?? DEFAULT_TTL)
    return body
  } catch {
    return null
  }
}

/**
 * Concurrent requests for the same URL share one fetch — link-card jobs run
 * in parallel, so duplicates would all miss the cache and all refetch
 * (Workers caps subrequests per request). Later callers inherit the first
 * caller's init and persist decision.
 */
const inFlight = new Map<string, Promise<string | null>>()

export const cachedFetchText = (
  url: string,
  init?: CachedFetchInit,
): Promise<string | null> => {
  let pending = inFlight.get(url)
  if (!pending) {
    pending = cachedFetch(url, init).finally(() => inFlight.delete(url))
    inFlight.set(url, pending)
  }
  // Failure is recorded per caller rather than inside the shared fetch, so
  // a caller that joins another render's in-flight fetch still marks its
  // own render as degraded.
  return pending.then(body => {
    if (body === null) markFetchFailed()
    return body
  })
}

export const cachedFetchJson = async <T>(
  url: string,
  init?: CachedFetchInit,
): Promise<T | null> => {
  const body = await cachedFetchText(url, init)
  if (body === null) return null
  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}
