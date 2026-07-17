import { UA_HEADER, cachedFetchJson, cachedFetchText } from '../fetch-cache.ts'
import { extractOg } from './html-meta.ts'
import type { LinkCardProvider } from './types.ts'

interface YtOembed {
  title: string
  author_name: string
  thumbnail_url: string
}

const parseStart = (url: URL) => {
  const t = url.searchParams.get('t') ?? url.searchParams.get('start')
  if (!t) return undefined
  return /^\d+$/.test(t) ? t : undefined
}

export const youtube: LinkCardProvider = {
  name: 'youtube',
  match: url => {
    const host = url.hostname.replace(/^www\./, '')
    let id: string | undefined
    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0]
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'watch') id = url.searchParams.get('v') ?? undefined
      else if (parts[0] === 'shorts' || parts[0] === 'embed') id = parts[1]
      // Channel roots only (@handle / channel/UC…): /videos etc. subpages
      // stay plain links.
      else if (parts.length === 1 && /^@[\w.-]+$/.test(parts[0])) {
        const profile: Record<string, string> = { handle: parts[0] }
        return { kind: 'profile', info: profile }
      } else if (
        parts[0] === 'channel' &&
        parts.length === 2 &&
        /^[\w-]+$/.test(parts[1])
      ) {
        const profile: Record<string, string> = { channel: parts[1] }
        return { kind: 'profile', info: profile }
      }
    }
    if (!id || !/^[\w-]{6,}$/.test(id)) return null
    const info: Record<string, string> = { id }
    const start = parseStart(url)
    if (start) info.start = start
    return { kind: 'video', info }
  },
  // Channels have no oembed; their pages ship og: meta (what chat link
  // previews use), so scrape that — the telegram provider's pattern.
  fetchMeta: async ({ kind, info }) => {
    if (kind === 'profile') {
      const path = info.handle ?? `channel/${info.channel}`
      const html = await cachedFetchText(`https://www.youtube.com/${path}`, {
        headers: UA_HEADER,
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

    const watchUrl = `https://www.youtube.com/watch?v=${info.id}`
    const data = await cachedFetchJson<YtOembed>(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    )
    if (!data) return null
    return {
      title: data.title,
      image: data.thumbnail_url,
      extra: { author: data.author_name },
    }
  },
}
