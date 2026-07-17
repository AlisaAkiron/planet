import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

/**
 * Copies the fence meta string (```ts title=...) into an hProperties
 * attribute. Plain hast `data` does not survive rehype-raw's reparse, but
 * element properties do; rehype-code consumes it from there.
 */
export const remarkCodeMeta = () => (tree: Root) => {
  visit(tree, 'code', node => {
    if (!node.meta) return
    node.data ??= {}
    node.data.hProperties = { ...node.data.hProperties, dataMeta: node.meta }
  })
}
