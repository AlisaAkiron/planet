import { UA_HEADER, cachedFetchText } from '../fetch-cache.ts'
import { extractOg, htmlToText } from './html-meta.ts'
import type { CardMediaItem, CardMeta, LinkCardProvider } from './types.ts'

const HOSTS = new Set(['t.me', 'telegram.me'])

const RESERVED = new Set(['addstickers', 'joinchat', 'proxy', 'share'])

const HEADERS = UA_HEADER

const WIDGET_TEXT =
  /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/
const WIDGET_OWNER =
  /class="tgme_widget_message_owner_name"[^>]*><span[^>]*>([\s\S]*?)<\/span>/
const WIDGET_PHOTO =
  /class="tgme_widget_message_user_photo[^"]*"[^>]*>\s*<img src="([^"]+)"/
const POST_PHOTOS =
  /tgme_widget_message_photo_wrap[^"]*"[^>]*background-image:url\('([^']+)'\)/g
const POST_VIDEO_THUMBS =
  /tgme_widget_message_video_thumb[^"]*"[^>]*background-image:url\('([^']+)'\)/g
const POST_VIDEO_SRCS = /<video[^>]+src="([^"]+)"/g

const postMedia = (html: string): CardMediaItem[] => {
  const items: CardMediaItem[] = [...html.matchAll(POST_PHOTOS)].map(match => ({
    type: 'photo' as const,
    url: match[1],
  }))
  const thumbs = [...html.matchAll(POST_VIDEO_THUMBS)].map(m => m[1])
  const srcs = [...html.matchAll(POST_VIDEO_SRCS)].map(m => m[1])
  thumbs.forEach((thumbnail, i) => {
    items.push({ type: 'video', url: srcs[i] ?? thumbnail, thumbnail })
  })
  return items
}

export const telegram: LinkCardProvider = {
  name: 'telegram',
  match: url => {
    if (!HOSTS.has(url.hostname)) return null
    let parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 's') parts = parts.slice(1)
    const [channel, id] = parts
    if (!channel || channel.startsWith('+') || RESERVED.has(channel)) {
      return null
    }
    const info: Record<string, string> = { channel }
    if (id && /^\d+$/.test(id)) return { kind: 'post', info: { ...info, id } }
    if (parts.length === 1) return { kind: 'channel', info }
    return null
  },
  // Public t.me pages only: posts via the embed widget markup, channels
  // via OpenGraph tags. Private/invite content never resolves.
  fetchMeta: async ({ kind, info }): Promise<CardMeta | null> => {
    if (kind === 'post') {
      const html = await cachedFetchText(
        `https://t.me/${info.channel}/${info.id}?embed=1&mode=tme`,
        { headers: HEADERS },
      )
      if (!html) return null
      const text = WIDGET_TEXT.exec(html)?.[1]
      const owner = WIDGET_OWNER.exec(html)?.[1]
      if (!text && !owner) return null
      const meta: CardMeta = {}
      if (owner) meta.title = htmlToText(owner)
      if (text) meta.description = htmlToText(text)
      const photo = WIDGET_PHOTO.exec(html)?.[1]
      if (photo) meta.image = photo
      const media = postMedia(html)
      if (media.length > 0) meta.media = media
      return meta
    }
    if (kind === 'channel') {
      const html = await cachedFetchText(`https://t.me/${info.channel}`, {
        headers: HEADERS,
      })
      if (!html) return null
      const title = extractOg(html, 'title')
      if (!title) return null
      return {
        title,
        description: extractOg(html, 'description'),
        image: extractOg(html, 'image'),
      }
    }
    return null
  },
}
