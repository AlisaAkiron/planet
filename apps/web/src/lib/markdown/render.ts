import { env } from 'cloudflare:workers'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { TRUSTED_MARKDOWN_ORIGINS } from '@/config/domains'
import { processMarkdown } from '@planet/markdown'
import { kvMarkdownCache } from './kv-cache.ts'
import {
  getCachedRender,
  putCachedRender,
  renderCacheKey,
} from './render-cache.ts'
import type { Frontmatter, TocEntry } from '@planet/markdown'

export type { Frontmatter, TocEntry } from '@planet/markdown'

/**
 * Only documents the site serves or trusts can be rendered — there is no
 * raw-content input. Rendering arbitrary markdown on demand (the editor
 * preview) is the preview server's job; on Workers it would hand anyone a
 * way to burn the CPU and subrequest budget.
 */
export interface MarkdownInput {
  /** Same-origin markdown path, e.g. '/docs/page.md', or an https URL on a trusted origin. */
  url: string
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
 * only on the server — the client receives a serialized hast tree.
 */
export const renderMarkdown = createServerFn({ method: 'POST' })
  .validator((input: MarkdownInput): MarkdownInput => {
    if (typeof input?.url !== 'string' || !isAllowedMarkdownUrl(input.url)) {
      throw new Error(
        'url must be a local markdown path or an https url on a trusted origin',
      )
    }
    return { url: input.url }
  })
  .handler(async ({ data }): Promise<SerializedMarkdown> => {
    const origin = new URL(getRequest().url).origin
    // Structural re-check after parsing: prefix checks on the raw string
    // can be steered to another host (e.g. backslash tricks), and the
    // cache treats fetched content as coming from trusted origins.
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
    const content = await response.text()
    // Every render is of a same-origin asset or a TRUSTED_MARKDOWN_ORIGINS
    // document that exists — a bounded key space — so all of them may
    // read and write KV.
    const key = await renderCacheKey(content)
    const cached = await getCachedRender(key)
    if (cached) return cached
    const { tree, toc, frontmatter, degraded } = await processMarkdown(
      content,
      { cache: kvMarkdownCache },
    )
    const result: SerializedMarkdown = {
      tree: JSON.stringify(tree),
      toc,
      frontmatter,
    }
    // Awaited, not fire-and-forget: the Workers runtime may cancel pending
    // work after the response is returned. A render whose link-card metadata
    // fetches failed is degraded, so it is never persisted — the next request
    // retries the fetches instead of freezing the failures for a full day.
    if (!degraded) await putCachedRender(key, result)
    return result
  })
