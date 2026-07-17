import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { rehypeCode } from './plugins/rehype-code.ts'
import { rehypeHeadings } from './plugins/rehype-headings.ts'
import { rehypeImageFigure } from './plugins/rehype-image-figure.ts'
import { rehypeLinkCards } from './plugins/rehype-link-cards.ts'
import { rehypeMedia } from './plugins/rehype-media.ts'
import { rehypeZoomImage } from './plugins/rehype-zoom-image.ts'
import { remarkCodeMeta } from './plugins/remark-code-meta.ts'
import { remarkFrontmatterData } from './plugins/remark-frontmatter-data.ts'
import type { TocEntry } from './plugins/rehype-headings.ts'
import type { Frontmatter } from './plugins/remark-frontmatter-data.ts'
import type { Root } from 'hast'

export interface MarkdownResult {
  tree: Root
  toc: TocEntry[]
  frontmatter: Frontmatter
}

export type { Frontmatter, TocEntry }

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
  .use(rehypeRaw)
  .use(rehypeKatex)
  .use(rehypeCode)
  .use(rehypeMedia)
  .use(rehypeImageFigure)
  .use(rehypeZoomImage)
  .use(rehypeLinkCards)
  .use(rehypeHeadings)

/**
 * Server-only: markdown string → JSON-serializable hast tree + ToC +
 * frontmatter. The tree is rendered to React by MarkdownView on both the
 * server (SSR) and client (hydration) without re-parsing.
 */
export const processMarkdown = async (
  content: string,
): Promise<MarkdownResult> => {
  const file = new VFile({ value: content })
  const mdast = processor.parse(file)
  const tree = (await processor.run(mdast, file)) as Root
  visit(tree, node => {
    delete node.position
  })
  return {
    tree,
    toc: file.data.toc ?? [],
    frontmatter: file.data.frontmatter ?? {},
  }
}
