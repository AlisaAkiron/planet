import { createFetcher } from './fetch.ts'
import { highlightMany } from './highlight.ts'
import type { MarkdownCache } from './cache.ts'
import type { FetchFailure, Fetcher } from './fetch.ts'
import type { HighlightRequest } from './highlight.ts'
import type { VFile } from 'vfile'

export interface RenderOptions {
  /** Where fetched metadata and highlighted code persist between renders. */
  cache?: MarkdownCache
  /** Seconds a failed metadata fetch is remembered; see FetchOptions. */
  failureTtl?: number
  /** The network call for metadata fetches; see FetchOptions. */
  fetch?: typeof fetch
  /**
   * Record on each link card why its metadata fetches failed
   * (CardPayload.failures), for hosts that show it — the editor preview.
   * Off by default: published pages just fall back to the plain card.
   */
  cardFailures?: boolean
  /**
   * Treat raw HTML in the document as hostile: drop script-capable
   * elements and attributes, sandbox iframes. For hosts that render
   * documents they didn't write — the preview. The site renders only
   * its owner's posts, where embeds may need the full HTML.
   */
  untrustedHtml?: boolean
}

/**
 * Per-render services handed to the plugins through the vfile. Passed
 * explicitly rather than through AsyncLocalStorage, so the renderer runs
 * unchanged on Workers, Node, or in a browser (worker).
 */
export interface RenderContext {
  fetch: Fetcher
  highlight: (requests: HighlightRequest[]) => Promise<string[]>
  /** Whether any metadata fetch in this render failed. */
  readonly failed: boolean
  /** Whether link cards should carry their failures; see RenderOptions. */
  readonly cardFailures: boolean
  /** See RenderOptions. */
  readonly untrustedHtml: boolean
  /**
   * The same context, with fetch failures also reported to `listener` —
   * how a link card collects the failures of its own fetches while cards
   * resolve concurrently.
   */
  observe: (listener: (failure: FetchFailure) => void) => RenderContext
}

declare module 'vfile' {
  interface DataMap {
    renderContext: RenderContext
  }
}

export const createRenderContext = ({
  cache,
  failureTtl,
  fetch,
  cardFailures = false,
  untrustedHtml = false,
}: RenderOptions = {}): RenderContext => {
  let failed = false
  const highlight = (requests: HighlightRequest[]) =>
    highlightMany(requests, cache)

  const withListener = (
    listener?: (failure: FetchFailure) => void,
  ): RenderContext => ({
    // Fetchers are cheap: the cache and the in-flight dedup they share are
    // keyed by the cache, not by fetcher.
    fetch: createFetcher({ cache, failureTtl, fetch }, failure => {
      // An unreadable body was still a successful fetch, cached as such;
      // re-rendering would only read it again. Only failures a retry can
      // fix keep a render out of the render cache.
      if (failure.reason !== 'invalid') failed = true
      listener?.(failure)
    }),
    highlight,
    get failed() {
      return failed
    },
    cardFailures,
    untrustedHtml,
    observe: next =>
      withListener(failure => {
        listener?.(failure)
        next(failure)
      }),
  })

  return withListener()
}

export const renderContextOf = (file: VFile): RenderContext => {
  const context = file.data.renderContext
  if (!context) throw new Error('render context missing from the vfile')
  return context
}
