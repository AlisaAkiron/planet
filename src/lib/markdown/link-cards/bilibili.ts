import { UA_HEADER, cachedFetchJson } from '../fetch-cache.ts'
import { compactNumber } from './format.ts'
import type { LinkCardProvider } from './types.ts'

interface BiliView {
  code: number
  data?: { title: string; pic: string; owner: { name: string } }
}

interface BiliCard {
  code: number
  data?: {
    card: { name: string; face: string; sign: string; attention: number }
    follower: number
    archive_count: number
  }
}

export const bilibili: LinkCardProvider = {
  name: 'bilibili',
  match: url => {
    const host = url.hostname.replace(/^(www|m)\./, '')
    if (host === 'space.bilibili.com') {
      const uid = url.pathname.split('/').filter(Boolean)[0]
      if (!uid || !/^\d+$/.test(uid)) return null
      const info: Record<string, string> = { uid }
      return { kind: 'profile', info }
    }
    if (host !== 'bilibili.com') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'video' || !parts[1]) return null
    const id = parts[1]
    if (!/^(BV\w+|av\d+)$/i.test(id)) return null
    return { kind: 'video', info: { id } }
  },
  // Videos: BV ids only — the legacy `av` form has no free lookup and
  // falls back to the URL-parsed card. Profiles: the web-interface card
  // endpoint is the one profile API that needs no wbi signing; it does
  // reject UA-less requests, hence the header.
  fetchMeta: async ({ kind, info }) => {
    if (kind === 'profile') {
      const data = await cachedFetchJson<BiliCard>(
        `https://api.bilibili.com/x/web-interface/card?mid=${info.uid}`,
        { headers: UA_HEADER },
      )
      if (data?.code !== 0 || !data.data) return null
      const { card, follower, archive_count: videos } = data.data
      const extra: Record<string, string> = {
        followers: compactNumber(follower),
        following: compactNumber(card.attention),
      }
      if (videos > 0) extra.videos = compactNumber(videos)
      return {
        title: card.name,
        description: card.sign || undefined,
        image: card.face.replace(/^http:/, 'https:'),
        extra,
      }
    }

    if (!info.id.toLowerCase().startsWith('bv')) return null
    const data = await cachedFetchJson<BiliView>(
      `https://api.bilibili.com/x/web-interface/view?bvid=${info.id}`,
    )
    if (data?.code !== 0 || !data.data) return null
    return {
      title: data.data.title,
      image: data.data.pic.replace(/^http:/, 'https:'),
      extra: { author: data.data.owner.name },
    }
  },
}
