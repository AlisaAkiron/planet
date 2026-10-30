import { escapeAttribute, escapeText } from 'entities'
import { toString } from 'hast-util-to-string'
import katex from 'katex'
import { SKIP, visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

const ERROR_COLOR = '#cc0000'

const classesOf = (node: Element): unknown[] =>
  Array.isArray(node.properties.className) ? node.properties.className : []

const isMathCode = (node: Element) =>
  node.tagName === 'code' &&
  classesOf(node).some(
    c => c === 'language-math' || c === 'math-display' || c === 'math-inline',
  )

/**
 * KaTeX → HTML string with rehype-katex's exact fallback ladder: strict
 * first, then lenient (KaTeX renders its own error markup for parse
 * errors), and finally hand-built error markup for anything else.
 */
const renderMath = (value: string, displayMode: boolean): string => {
  try {
    return katex.renderToString(value, { displayMode, throwOnError: true })
  } catch (error) {
    try {
      return katex.renderToString(value, {
        displayMode,
        strict: 'ignore',
        throwOnError: false,
      })
    } catch {
      return `<span class="katex-error" style="color:${ERROR_COLOR}" title="${escapeAttribute(String(error))}">${escapeText(value)}</span>`
    }
  }
}

/**
 * Renders remark-math output with KaTeX into <katex-math mode html>:
 *   <pre><code class="language-math math-display">  → mode="display"
 *   <code class="language-math math-inline">         → mode="inline"
 * Unlike rehype-katex, the rendered markup stays an HTML string instead
 * of being reparsed into hast — KatexMath injects it verbatim, so neither
 * the server nor the client walks KaTeX's deeply nested spans.
 */
export const rehypeMath = () => (tree: Root) => {
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || index === undefined) return
    let scope: Element = node
    let displayMode: boolean
    if (node.tagName === 'pre') {
      // ```math fences and $$ blocks both arrive as <pre><code>
      const code = node.children[0]
      if (code?.type !== 'element' || !isMathCode(code)) return
      displayMode = true
    } else if (isMathCode(node)) {
      if (parent.type === 'element' && parent.tagName === 'pre') return
      displayMode = classesOf(node).includes('math-display')
      scope = node
    } else {
      return
    }
    const value = toString(scope)
    parent.children[index] = {
      type: 'element',
      tagName: 'katex-math',
      properties: {
        mode: displayMode ? 'display' : 'inline',
        html: renderMath(value, displayMode),
      },
      children: [],
    }
    return SKIP
  })
}
