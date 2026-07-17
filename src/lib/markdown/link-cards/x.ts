import { UA_HEADER, cachedFetchJson } from '../fetch-cache.ts'
import { compactNumber, formatFullDate, formatMonthYear } from './format.ts'
import type { CardMediaItem, CardMeta, LinkCardProvider } from './types.ts'

interface SyndicationTweet {
  __typename?: string
  text?: string
  created_at?: string
  user?: {
    name: string
    screen_name: string
    profile_image_url_https?: string
  }
}

interface FxTweet {
  code: number
  tweet?: {
    text?: string
    created_timestamp?: number
    author?: { name: string; screen_name: string; avatar_url?: string }
    media?: {
      photos?: { url: string }[]
      videos?: { url?: string; thumbnail_url?: string }[]
    }
  }
}

interface FxUser {
  code: number
  user?: {
    name: string
    screen_name: string
    description?: string
    location?: string
    avatar_url?: string
    followers?: number
    following?: number
    tweets?: number
    joined?: string
    website?: { url?: string } | null
  }
}

const FX_API = 'https://api.fxtwitter.com'

const HEADERS = UA_HEADER

const mediaItems = (media?: {
  photos?: { url: string }[]
  videos?: { url?: string; thumbnail_url?: string }[]
}): CardMediaItem[] => {
  const items: CardMediaItem[] = []
  for (const photo of media?.photos ?? []) {
    if (photo.url) items.push({ type: 'photo', url: photo.url })
  }
  for (const video of media?.videos ?? []) {
    const url = video.url ?? video.thumbnail_url
    if (!url) continue
    items.push({ type: 'video', url, thumbnail: video.thumbnail_url })
  }
  return items
}

/**
 * Access token for the public syndication endpoint, derived from the
 * tweet id the same way react-tweet does.
 */
const syndicationToken = (id: string) =>
  ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '')

const HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'])

const RESERVED = new Set([
  'explore',
  'hashtag',
  'home',
  'i',
  'messages',
  'notifications',
  'search',
  'settings',
])

export const x: LinkCardProvider = {
  name: 'x',
  match: url => {
    if (!HOSTS.has(url.hostname)) return null
    const parts = url.pathname.split('/').filter(Boolean)
    const [handle, section, id] = parts
    if (!handle || RESERVED.has(handle.toLowerCase())) return null
    const info: Record<string, string> = { handle }
    if (parts.length === 1) return { kind: 'profile', info }
    if (section === 'status' && id && /^\d+$/.test(id)) {
      return { kind: 'post', info: { ...info, id } }
    }
    return null
  },
  // X has no free official API. Primary source is FxTwitter's public API
  // (covers posts from any public account, plus profiles); the syndication
  // endpoint react-tweet uses is the post fallback — it tombstones posts
  // from many smaller accounts.
  fetchMeta: async ({ kind, info }): Promise<CardMeta | null> => {
    if (kind === 'profile') {
      const fx = await cachedFetchJson<FxUser>(`${FX_API}/${info.handle}`, {
        headers: HEADERS,
      })
      const user = fx?.code === 200 ? fx.user : undefined
      if (!user) return null
      const extra: Record<string, string> = {}
      if (user.followers !== undefined) {
        extra.followers = compactNumber(user.followers)
      }
      if (user.following !== undefined) {
        extra.following = compactNumber(user.following)
      }
      if (user.tweets !== undefined) extra.posts = compactNumber(user.tweets)
      if (user.location) extra.location = user.location
      if (user.website?.url) extra.website = user.website.url
      const joined = user.joined ? formatMonthYear(user.joined) : undefined
      if (joined) extra.joined = joined
      return {
        title: user.name,
        description: user.description || undefined,
        image: user.avatar_url?.replace('_normal', '_400x400'),
        extra,
      }
    }

    if (kind !== 'post') return null

    const fx = await cachedFetchJson<FxTweet>(
      `${FX_API}/${info.handle}/status/${info.id}`,
      { headers: HEADERS },
    )
    const fxTweet = fx?.code === 200 ? fx.tweet : undefined
    if (fxTweet?.text !== undefined && fxTweet.author) {
      const meta: CardMeta = {
        title: fxTweet.author.name,
        description: fxTweet.text,
        image: fxTweet.author.avatar_url,
        extra: { handle: fxTweet.author.screen_name },
      }
      const date = fxTweet.created_timestamp
        ? formatFullDate(fxTweet.created_timestamp * 1000)
        : undefined
      if (date) meta.extra = { ...meta.extra, date }
      const media = mediaItems(fxTweet.media)
      if (media.length > 0) meta.media = media
      return meta
    }

    const tweet = await cachedFetchJson<SyndicationTweet>(
      `https://cdn.syndication.twimg.com/tweet-result?id=${info.id}&token=${syndicationToken(info.id)}`,
    )
    // eslint-disable-next-line no-underscore-dangle -- X API field name
    if (!tweet?.text || tweet.__typename === 'TweetTombstone') return null
    const meta: CardMeta = { description: tweet.text }
    if (tweet.user) {
      meta.title = tweet.user.name
      if (tweet.user.profile_image_url_https) {
        meta.image = tweet.user.profile_image_url_https
      }
      meta.extra = { handle: tweet.user.screen_name }
    }
    if (tweet.created_at) {
      const date = formatFullDate(tweet.created_at)
      if (date) meta.extra = { ...meta.extra, date }
    }
    return meta
  },
}
