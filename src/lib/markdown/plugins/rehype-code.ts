import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import { highlightMany } from '../highlight-cache.ts'
import type { Element, Root } from 'hast'

interface CodeTarget {
  node: Element
  index: number
  parent: Element | Root
}

interface CodeBlock extends CodeTarget {
  lang: string
  title: string | undefined
  source: string
}

const languageOf = (code: Element): string => {
  const className = code.properties.className
  if (!Array.isArray(className)) return 'text'
  const langClass = className.find(
    c => typeof c === 'string' && c.startsWith('language-'),
  )
  return typeof langClass === 'string'
    ? langClass.slice('language-'.length)
    : 'text'
}

const TITLE_META = /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|(\S+))/

/**
 * File path for the block header, from either fence syntax:
 *   ```ts:src/index.ts
 *   ```ts title=src/index.ts     (or title="src/index.ts")
 */
const parseFence = (rawLang: string, code: Element) => {
  const [lang = 'text', ...rest] = rawLang.split(':')
  let title = rest.length > 0 ? rest.join(':') : undefined
  if (!title) {
    // stashed by remark-code-meta (survives rehype-raw, unlike hast data)
    const meta = code.properties.dataMeta
    const match = typeof meta === 'string' ? TITLE_META.exec(meta) : null
    if (match) title = match[1] ?? match[2] ?? match[3]
  }
  return { lang, title }
}

/**
 * Replaces markdown code fences with highlighted output:
 *   ```mermaid  → <mermaid-block code="...">   (client renders the SVG)
 *   ```<lang>   → <code-block lang="..." html="<pre class=shiki>…">
 * The highlighted markup travels as an HTML string (see shiki.ts) that
 * CodeBlock injects verbatim. Unknown languages fall back to plain text.
 */
export const rehypeCode = () => async (tree: Root) => {
  const targets: CodeTarget[] = []
  visit(tree, 'element', (node, index, parent) => {
    if (node.tagName !== 'pre' || index === undefined || !parent) return
    if (parent.type !== 'element' && parent.type !== 'root') return
    const code = node.children[0]
    if (code?.type !== 'element' || code.tagName !== 'code') return
    targets.push({ node, index, parent })
  })
  if (targets.length === 0) return

  const blocks: CodeBlock[] = []
  for (const target of targets) {
    const code = target.node.children[0] as Element
    const { lang, title } = parseFence(languageOf(code), code)
    const source = toString(code).replace(/\n$/, '')
    if (lang === 'mermaid') {
      target.parent.children[target.index] = {
        type: 'element',
        tagName: 'mermaid-block',
        properties: { code: source },
        children: [],
      }
      continue
    }
    blocks.push({ ...target, lang, title, source })
  }

  const htmls = await highlightMany(
    blocks.map(({ source, lang }) => ({ code: source, lang })),
  )
  blocks.forEach(({ parent, index, lang, title, source }, i) => {
    parent.children[index] = {
      type: 'element',
      tagName: 'code-block',
      properties: {
        lang,
        lines: source.split('\n').length,
        title,
        html: htmls[i],
      },
      children: [],
    }
  })
}
