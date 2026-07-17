import { SKIP, visit } from 'unist-util-visit'
import { matchLinkCard, resolveCardMeta } from '../link-cards/index.ts'
import { bareLinkHref, soleSignificantChild } from './bare-link.ts'
import type { CardPayload } from '../link-cards/index.ts'
import type { Root } from 'hast'

/**
 * Turns paragraphs containing only a bare link (autolink or [url](url))
 * that matches a registered provider into <link-card card="<json>">.
 * Metadata is resolved server-side here so the client never fetches.
 */
export const rehypeLinkCards = () => async (tree: Root) => {
  const jobs: Promise<void>[] = []
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || index === undefined || node.tagName !== 'p') return
    const link = soleSignificantChild(node)
    if (link?.type !== 'element' || link.tagName !== 'a') return
    const href = bareLinkHref(link)
    if (!href) return
    const parsed = matchLinkCard(href)
    if (!parsed) return
    jobs.push(
      (async () => {
        const meta = await resolveCardMeta(parsed)
        const payload: CardPayload = { ...parsed, meta }
        parent.children[index] = {
          type: 'element',
          tagName: 'link-card',
          properties: { card: JSON.stringify(payload) },
          children: [],
        }
      })(),
    )
    return SKIP
  })
  await Promise.all(jobs)
}
