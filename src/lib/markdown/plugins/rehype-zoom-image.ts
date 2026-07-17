import { SKIP, visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

/**
 * Renames every <img> that is not inside a link to <zoom-image>
 * (rendered by ZoomImage as a Medium-style click-to-zoom viewer).
 * Linked images ([![badge](img)](url) and raw-HTML equivalents) keep
 * plain <img> so the link stays the click target. Runs after
 * rehypeMedia, so images pointing at media files have already become
 * <media-embed>, and after rehypeRaw, so raw-HTML images are covered.
 */
export const rehypeZoomImage = () => (tree: Root) => {
  // Raw HTML can nest an image arbitrarily deep inside <a>, so collect
  // linked images up front instead of checking direct parents.
  const linked = new Set<Element>()
  visit(tree, 'element', node => {
    if (node.tagName !== 'a') return
    visit(node, 'element', inner => {
      if (inner.tagName === 'img') linked.add(inner)
    })
    return SKIP
  })
  visit(tree, 'element', node => {
    if (node.tagName === 'img' && !linked.has(node)) {
      node.tagName = 'zoom-image'
    }
  })
}
