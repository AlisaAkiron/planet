import { toString } from 'hast-util-to-string'
import type { Element, ElementContent } from 'hast'

/** The node's only child that isn't whitespace text, if any. */
export const soleSignificantChild = (node: Element): ElementContent | null => {
  const children = node.children.filter(
    c => !(c.type === 'text' && c.value.trim() === ''),
  )
  return children.length === 1 ? children[0] : null
}

/** href of a link whose visible text is the URL itself (autolink / [url](url)). */
export const bareLinkHref = (link: Element): string | null => {
  const href = String(link.properties.href ?? '')
  return href !== '' && toString(link) === href ? href : null
}
