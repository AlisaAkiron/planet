import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { EXIT, visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { createRenderContext, renderContextOf } from './context.ts'
import { guardRawHtml } from './plugins/raw-html-guard.ts'
import { rehypeCode } from './plugins/rehype-code.ts'
import { rehypeHeadings } from './plugins/rehype-headings.ts'
import { rehypeImageFigure } from './plugins/rehype-image-figure.ts'
import { rehypeLinkCards } from './plugins/rehype-link-cards.ts'
import { rehypeMath } from './plugins/rehype-math.ts'
import { rehypeMedia } from './plugins/rehype-media.ts'
import { rehypeZoomImage } from './plugins/rehype-zoom-image.ts'
import { remarkCodeMeta } from './plugins/remark-code-meta.ts'
import { remarkFrontmatterData } from './plugins/remark-frontmatter-data.ts'
import type { RenderOptions } from './context.ts'
import type { TocEntry } from './plugins/rehype-headings.ts'
import type { Frontmatter } from './plugins/remark-frontmatter-data.ts'
import type { Root } from 'hast'
import type { Plugin } from 'unified'

/**
 * Bump whenever a pipeline or plugin change alters render output. Apps
 * that cache finished renders put it in their cache keys, so old entries
 * are never read again and expire via TTL — no purge logic needed.
 */
export const RENDER_VERSION = 3

export interface MarkdownResult {
  tree: Root
  toc: TocEntry[]
  frontmatter: Frontmatter
  /**
   * Some link-card metadata fetch failed, so cards fell back to their
   * URL-parsed form. Callers caching whole renders should skip this one —
   * the next render retries the fetches instead of freezing the failures.
   */
  degraded: boolean
}

export type { Frontmatter, RenderOptions, TocEntry }

/**
 * rehype-raw serializes the whole tree and reparses it with parse5 so
 * that raw HTML nodes get real element structure. That is only useful
 * when the document contains raw HTML; for the common case without any,
 * skip the round trip. Whatever raw HTML produced is then guarded (see
 * raw-html-guard.ts).
 */
const rehypeRawWhenNeeded: Plugin<[], Root> = function () {
  const transform = rehypeRaw.call(this)
  return (tree, file) => {
    let hasRaw = false
    visit(tree, 'raw', () => {
      hasRaw = true
      return EXIT
    })
    if (!hasRaw) return
    const parsed = (transform?.(tree, file) ?? tree) as Root
    guardRawHtml(parsed, renderContextOf(file).untrustedHtml)
    return parsed
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkFrontmatterData)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkCodeMeta)
  .use(remarkRehype, {
    allowDangerousHtml: true,
    // visible, styleable label instead of the default sr-only heading
    footnoteLabelProperties: { className: ['footnotes-label'] },
  })
  .use(rehypeRawWhenNeeded)
  .use(rehypeMath)
  .use(rehypeCode)
  .use(rehypeMedia)
  .use(rehypeImageFigure)
  .use(rehypeZoomImage)
  .use(rehypeLinkCards)
  .use(rehypeHeadings)

/**
 * Server-only: markdown string → JSON-serializable hast tree + ToC +
 * frontmatter. The tree is rendered to React by MarkdownView on both the
 * server (SSR) and client (hydration) without re-parsing. Highlighted code
 * and rendered math are embedded as HTML strings, so the tree stays a few
 * hundred nodes even for code-heavy documents. Runs anywhere with fetch
 * and WebCrypto; the app decides where caches live through `options`.
 */
export const processMarkdown = async (
  content: string,
  options?: RenderOptions,
): Promise<MarkdownResult> => {
  const context = createRenderContext(options)
  const file = new VFile({ value: content, data: { renderContext: context } })
  const mdast = processor.parse(file)
  const tree = (await processor.run(mdast, file)) as Root
  visit(tree, node => {
    delete node.position
  })
  return {
    tree,
    toc: file.data.toc ?? [],
    frontmatter: file.data.frontmatter ?? {},
    degraded: context.failed,
  }
}
