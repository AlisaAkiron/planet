import type { Element, Root, RootContent } from 'hast'

/**
 * Elements the pipeline itself creates, which MarkdownView maps to
 * components. Their properties are trusted (CodeBlock and KatexMath inject
 * `html` as markup, link-card payloads carry highlighted code), so raw
 * HTML must never be able to spell them.
 */
const INTERNAL_ELEMENTS = new Set([
  'code-block',
  'katex-math',
  'link-card',
  'media-embed',
  'mermaid-block',
  'zoom-image',
])

/**
 * Raw-HTML elements dropped, with their content, from untrusted documents:
 * ones that run script or load active content, redirect the page, or
 * animate an attribute into a javascript: URL.
 */
const ACTIVE_ELEMENTS = new Set([
  'script',
  'object',
  'embed',
  'applet',
  'frame',
  'frameset',
  'meta',
  'base',
  'link',
  'animate',
  'set',
])

/**
 * Embedded pages keep scripts and their own origin's storage (video
 * players need both) but can't navigate the preview or open dialogs.
 */
const IFRAME_SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-presentation',
]

// Browsers drop ASCII whitespace and control characters inside a URL
// scheme, so `java\tscript:` still runs.
const SCRIPT_URL = /^(?:javascript|vbscript):/i
const isScriptUrl = (value: string) =>
  SCRIPT_URL.test([...value].filter(char => char.charCodeAt(0) > 0x20).join(''))

const guardElement = (node: Element) => {
  for (const [key, value] of Object.entries(node.properties)) {
    if (/^on/i.test(key) || (typeof value === 'string' && isScriptUrl(value))) {
      delete node.properties[key]
    }
  }
  if (node.tagName === 'iframe') {
    // srcdoc runs in the embedding page's origin, sandbox or not.
    delete node.properties.srcDoc
    node.properties.sandbox = [...IFRAME_SANDBOX]
  }
}

/**
 * Runs right after rehype-raw, before any plugin creates its own elements,
 * so everything it sees came from the document. Internal element names are
 * always unwrapped to their content. With `untrusted` — the preview, which
 * renders whatever an editor sends it — script-capable markup goes too:
 * the published site only renders its owner's posts.
 */
export const guardRawHtml = (tree: Root, untrusted: boolean) => {
  const walk = (parent: Root | Element) => {
    parent.children = (parent.children as RootContent[]).flatMap(
      (child): RootContent[] => {
        if (child.type !== 'element') return [child]
        if (untrusted && ACTIVE_ELEMENTS.has(child.tagName)) return []
        walk(child)
        if (child.content) walk(child.content)
        if (INTERNAL_ELEMENTS.has(child.tagName)) return child.children
        if (untrusted) guardElement(child)
        return [child]
      },
    ) as Element['children']
  }
  walk(tree)
}
