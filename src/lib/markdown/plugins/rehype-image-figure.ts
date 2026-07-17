import { SKIP, visit } from 'unist-util-visit'
import { soleSignificantChild } from './bare-link.ts'
import type { Element, Root } from 'hast'

/**
 * Turns a paragraph whose only content is a titled image (optionally
 * link-wrapped) into <figure><img/><figcaption>title</figcaption></figure>,
 * making the title visible as a caption instead of hover-only. The whole
 * paragraph is replaced because <figure> can't live inside <p> — the HTML
 * parser would close the paragraph early and break hydration. Runs after
 * rehypeMedia (media-file images are already <media-embed>, which renders
 * its own figcaption) and before rehypeZoomImage (the img inside the
 * figure still becomes <zoom-image>).
 */
export const rehypeImageFigure = () => (tree: Root) => {
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || index === undefined || node.tagName !== 'p') return
    const child = soleSignificantChild(node)
    if (child?.type !== 'element') return

    let img: Element | undefined
    if (child.tagName === 'img') {
      img = child
    } else if (child.tagName === 'a') {
      const inner = soleSignificantChild(child)
      if (inner?.type === 'element' && inner.tagName === 'img') img = inner
    }
    const title = img?.properties.title
    if (typeof title !== 'string' || title === '') return

    parent.children[index] = {
      type: 'element',
      tagName: 'figure',
      properties: {},
      children: [
        child,
        {
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: title }],
        },
      ],
    }
    return SKIP
  })
}
