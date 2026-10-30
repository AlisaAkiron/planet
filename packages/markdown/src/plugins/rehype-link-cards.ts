import { SKIP, visit } from 'unist-util-visit'
import { renderContextOf } from '../context.ts'
import { matchLinkCard, resolveCardMeta } from '../link-cards/index.ts'
import { bareLinkHref, soleSignificantChild } from './bare-link.ts'
import type { FetchFailure } from '../fetch.ts'
import type { CardPayload } from '../link-cards/index.ts'
import type { Root } from 'hast'
import type { VFile } from 'vfile'

/**
 * Turns paragraphs containing only a bare link (autolink or [url](url))
 * that matches a registered provider into <link-card card="<json>">.
 * Metadata is resolved server-side here so the client never fetches.
 */
export const rehypeLinkCards = () => async (tree: Root, file: VFile) => {
  const context = renderContextOf(file)
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
        const failures: FetchFailure[] = []
        const record = (failure: FetchFailure) => failures.push(failure)
        const meta = await resolveCardMeta(
          parsed,
          context.cardFailures ? context.observe(record) : context,
          record,
        )
        const payload: CardPayload = { ...parsed, meta }
        if (context.cardFailures && failures.length > 0) {
          payload.failures = failures
        }
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
