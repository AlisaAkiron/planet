import GithubSlugger from 'github-slugger'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import type { Root } from 'hast'
import type { VFile } from 'vfile'

export interface TocEntry {
  id: string
  depth: number
  text: string
}

declare module 'vfile' {
  interface DataMap {
    toc: TocEntry[]
  }
}

const HEADING = /^h([1-6])$/

/**
 * Gives every heading a GitHub-style slug id (Unicode-safe: CJK and emoji
 * survive, duplicates get -1/-2 suffixes), appends a hover anchor link, and
 * collects the ToC into vfile data.
 */
export const rehypeHeadings = () => (tree: Root, file: VFile) => {
  const slugger = new GithubSlugger()
  const toc: TocEntry[] = []
  visit(tree, 'element', node => {
    const match = HEADING.exec(node.tagName)
    if (!match) return
    // Skip headings that already carry an id (e.g. the GFM footnotes label,
    // which other nodes reference via aria-labelledby).
    if (node.properties.id) return
    const text = toString(node)
    const id = slugger.slug(text)
    node.properties.id = id
    toc.push({ id, depth: Number(match[1]), text })
    node.children.push({
      type: 'element',
      tagName: 'a',
      properties: {
        href: `#${id}`,
        className: ['heading-anchor'],
        ariaHidden: 'true',
        tabIndex: -1,
      },
      children: [{ type: 'text', value: '#' }],
    })
  })
  file.data.toc = toc
}
