import { AsyncLocalStorage } from 'node:async_hooks'

const FAILED_HEADER = 'x-planet-fetch-failed'
const FAILURE_TTL = 300
const MAX_TEXT_CHARS = 500_000

/** Some metadata hosts reject requests without a User-Agent. */
export const UA_HEADER = { 'User-Agent': 'planet-markdown-renderer' }

export type CachedFetchInit = RequestInit & { ttl?: number }

/**
 * Per-render failure flag. cachedFetch swallows every failure to null so
 * rendering never breaks, which makes a failed fetch indistinguishable from
 * a legitimately empty result (a tombstoned tweet, an av-form Bilibili link).
 * This flag records that a fetch actually failed — a negative-cache hit
 * counts too — so the caller can decline to persist a degraded render.
 */
const fetchTracking = new AsyncLocalStorage<{ failed: boolean }>()

const markFetchFailed = () => {
  const tracking = fetchTracking.getStore()
  if (tracking) tracking.failed = true
}

/**
 * Runs `fn` while watching for cachedFetch failures inside it. Returns the
 * result alongside whether any fetch failed. If the async context is ever
 * lost, `anyFailed` stays false — the render is still cached, so this can
 * only fail open (never worse than not tracking at all).
 */
export const withFetchFailureTracking = async <T>(
  fn: () => Promise<T>,
): Promise<{ result: T; anyFailed: boolean }> => {
  const tracking = { failed: false }
  const result = await fetchTracking.run(tracking, fn)
  return { result, anyFailed: tracking.failed }
}

/**
 * Fetch with Cloudflare Workers cache + hard timeout, returning the body
 * text or null on any failure — link-card metadata is always optional
 * decoration, so failures must never break rendering.
 *
 * Failures are negative-cached for 5 minutes so an unreachable host adds
 * its timeout to one render, not every render. Redirects are followed
 * manually, one hop, and only to the same https host — GitHub's API 301s
 * renamed/transferred repos to canonical URLs, but a metadata host must
 * never be able to pivot the fetch elsewhere.
 */
const cachedFetch = async (
  url: string,
  init?: CachedFetchInit,
): Promise<string | null> => {
  const ttl = init?.ttl ?? 3600
  const cache = (
    globalThis.caches as (CacheStorage & { default?: Cache }) | undefined
  )?.default
  const cacheKey = new Request(url)

  try {
    const hit = await cache?.match(cacheKey)
    if (hit) {
      if (hit.headers.get(FAILED_HEADER)) {
        markFetchFailed()
        return null
      }
      return await hit.text()
    }
  } catch {
    // cache unavailable (local dev, plain node) — fall through to fetch
  }

  const writeCache = async (body: string, maxAge: number, failed: boolean) => {
    try {
      await cache?.put(
        cacheKey,
        new Response(body, {
          headers: {
            'Cache-Control': `public, max-age=${maxAge}`,
            ...(failed ? { [FAILED_HEADER]: '1' } : {}),
          },
        }),
      )
    } catch {
      // cache write is best-effort
    }
  }

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
    if (!response.ok) {
      markFetchFailed()
      await writeCache('', FAILURE_TTL, true)
      return null
    }
    const body = (await response.text()).slice(0, MAX_TEXT_CHARS)
    await writeCache(body, ttl, false)
    return body
  } catch {
    markFetchFailed()
    await writeCache('', FAILURE_TTL, true)
    return null
  }
}

/**
 * Concurrent requests for the same URL share one fetch — link-card jobs run
 * in parallel, so duplicates would all miss the cache and all refetch
 * (Workers caps subrequests per request). Later callers inherit the first
 * caller's init.
 */
const inFlight = new Map<string, Promise<string | null>>()

export const cachedFetchText = (
  url: string,
  init?: CachedFetchInit,
): Promise<string | null> => {
  const pending = inFlight.get(url)
  if (pending) return pending
  const request = cachedFetch(url, init).finally(() => inFlight.delete(url))
  inFlight.set(url, request)
  return request
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
