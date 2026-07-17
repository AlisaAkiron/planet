import { SKIP, visit } from 'unist-util-visit'
import { bareLinkHref, soleSignificantChild } from './bare-link.ts'
import type { Root } from 'hast'

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(?:[?#]|$)/i
const AUDIO_RE = /\.(mp3|wav|ogg|oga|flac|m4a|aac|opus)(?:[?#]|$)/i

const mediaKind = (url: string): string | null =>
  VIDEO_RE.test(url) ? 'video' : AUDIO_RE.test(url) ? 'audio' : null

/**
 * Turns paragraphs that contain only a bare media-file link (or only an
 * image whose src is a media file) into <media-embed kind src title?>.
 */
export const rehypeMedia = () => (tree: Root) => {
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || index === undefined || node.tagName !== 'p') return
    const child = soleSignificantChild(node)
    if (child?.type !== 'element') return

    let src: string | undefined
    let title: string | undefined
    if (child.tagName === 'a') {
      src = bareLinkHref(child) ?? undefined
    } else if (child.tagName === 'img') {
      src = String(child.properties.src ?? '')
      if (child.properties.alt) title = String(child.properties.alt)
    } else {
      return
    }

    const kind = src ? mediaKind(src) : null
    if (!kind || !src) return
    parent.children[index] = {
      type: 'element',
      tagName: 'media-embed',
      properties: { kind, src, title },
      children: [],
    }
    return SKIP
  })
}
