import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import { SHIKI_THEMES, getHighlighter, resolveLoadedLang } from '../shiki.ts'
import type { Element, Root } from 'hast'

interface CodeTarget {
  node: Element
  index: number
  parent: Element | Root
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
 *   ```<lang>   → <code-block lang="..."> wrapping shiki's <pre class="shiki">
 * Unknown languages fall back to plain text highlighting.
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

  const highlighter = await getHighlighter()

  for (const { node, index, parent } of targets) {
    const code = node.children[0] as Element
    const { lang, title } = parseFence(languageOf(code), code)
    const source = toString(code).replace(/\n$/, '')

    if (lang === 'mermaid') {
      parent.children[index] = {
        type: 'element',
        tagName: 'mermaid-block',
        properties: { code: source },
        children: [],
      }
      continue
    }

    const highlighted = highlighter.codeToHast(source, {
      lang: resolveLoadedLang(highlighter, lang),
      themes: SHIKI_THEMES,
      defaultColor: false,
    })
    parent.children[index] = {
      type: 'element',
      tagName: 'code-block',
      properties: { lang, lines: source.split('\n').length, title },
      children: highlighted.children as Element[],
    }
  }
}
