import { env } from 'cloudflare:workers'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { TRUSTED_MARKDOWN_ORIGINS } from '@/config/domains'
import { processMarkdown } from './pipeline.ts'
import {
  getCachedRender,
  putCachedRender,
  renderCacheKey,
} from './render-cache.ts'
import type { Frontmatter, TocEntry } from './pipeline.ts'

export type { Frontmatter, MarkdownResult, TocEntry } from './pipeline.ts'

export interface MarkdownInput {
  /** Raw markdown source. */
  content?: string
  /** Same-origin markdown path, e.g. '/docs/page.md', or an https URL on a trusted origin. */
  url?: string
}

/**
 * Wire format of renderMarkdown: the hast tree crosses the RPC boundary as
 * a JSON string — one opaque value instead of thousands of nodes for the
 * serializer to walk. MarkdownView accepts it directly.
 */
export interface SerializedMarkdown {
  tree: string
  toc: TocEntry[]
  frontmatter: Frontmatter
}

const MARKDOWN_EXT = /\.(md|markdown)$/i

const isAllowedMarkdownUrl = (raw: string) => {
  if (raw.startsWith('/')) {
    return (
      !raw.startsWith('//') &&
      // WHATWG URL treats backslashes like slashes, so '/\evil.com/x.md'
      // would resolve protocol-relative; the handler re-checks structurally.
      !raw.includes('\\') &&
      MARKDOWN_EXT.test(raw.split(/[?#]/)[0])
    )
  }
  try {
    const parsed = new URL(raw)
    return (
      TRUSTED_MARKDOWN_ORIGINS.includes(parsed.origin) &&
      MARKDOWN_EXT.test(parsed.pathname)
    )
  } catch {
    return false
  }
}

/**
 * The whole markdown pipeline (remark/rehype/shiki/katex/link cards) runs
 * only on the server — the client receives a serialized hast tree. POST so
 * long raw content never hits URL length limits.
 */
export const renderMarkdown = createServerFn({ method: 'POST' })
  .validator((input: MarkdownInput): MarkdownInput => {
    if (input.url !== undefined) {
      if (!isAllowedMarkdownUrl(input.url)) {
        throw new Error(
          'url must be a local markdown path or an https url on a trusted origin',
        )
      }
      return { url: input.url }
    }
    if (typeof input.content !== 'string') {
      throw new Error('renderMarkdown requires either content or url')
    }
    return { content: input.content }
  })
  .handler(async ({ data }): Promise<SerializedMarkdown> => {
    let content: string
    if (data.url !== undefined) {
      const origin = new URL(getRequest().url).origin
      // Structural re-check after parsing: prefix checks on the raw string
      // can be steered to another host (e.g. backslash tricks), and the
      // cache treats url-sourced content as coming from trusted origins.
      const target = new URL(data.url, origin)
      if (
        (target.origin !== origin &&
          !TRUSTED_MARKDOWN_ORIGINS.includes(target.origin)) ||
        !MARKDOWN_EXT.test(target.pathname)
      ) {
        throw new Error(
          'url must be a local markdown path or an https url on a trusted origin',
        )
      }
      // Same-origin paths must go through the assets binding: a deployed
      // Worker's fetch to its own hostname skips the assets layer and is
      // routed to the (nonexistent) origin server — HTTP 522. The plain
      // fetch fallback covers non-Workers contexts without the binding;
      // external fetches are limited to TRUSTED_MARKDOWN_ORIGINS above.
      const response =
        target.origin === origin && env.ASSETS
          ? await env.ASSETS.fetch(target)
          : await fetch(target, {
              redirect: 'manual',
              signal: AbortSignal.timeout(5000),
            })
      if (!response.ok) {
        throw new Error(`Failed to load ${data.url}: HTTP ${response.status}`)
      }
      content = await response.text()
    } else {
      content = data.content ?? ''
    }
    // Only url-sourced renders are cached: the url path is restricted to
    // same-origin assets or TRUSTED_MARKDOWN_ORIGINS documents that exist
    // (a bounded key space), while raw content arrives from a public POST
    // body — caching it would let arbitrary requests mint unbounded KV
    // writes.
    const key = data.url !== undefined ? await renderCacheKey(content) : null
    if (key) {
      const cached = await getCachedRender(key)
      if (cached) return cached
    }
    const { tree, toc, frontmatter } = await processMarkdown(content)
    const result: SerializedMarkdown = {
      tree: JSON.stringify(tree),
      toc,
      frontmatter,
    }
    // Awaited, not fire-and-forget: the Workers runtime may cancel
    // pending work after the response is returned.
    if (key) await putCachedRender(key, result)
    return result
  })
