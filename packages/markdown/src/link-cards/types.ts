import type { RenderContext } from '../context.ts'
import type { FetchFailure } from '../fetch.ts'

export interface ParsedCard {
  provider: string
  url: string
  kind: string
  info: Record<string, string>
}

export interface LanguageStat {
  name: string
  percent: number
  color: string
}

export interface CardMediaItem {
  type: 'photo' | 'video'
  /** photo url, or the video file url when known */
  url: string
  /** preview image for videos */
  thumbnail?: string
}

export interface CardMeta {
  title?: string
  description?: string
  image?: string
  extra?: Record<string, string>
  /** Repo cards: language share, largest first. */
  languages?: LanguageStat[]
  /** File cards: shiki-highlighted snippet (server-generated, escaped). */
  codeHtml?: string
  /** Content cards: post photos / video previews. */
  media?: CardMediaItem[]
}

export interface CardPayload extends ParsedCard {
  meta: CardMeta | null
  /**
   * Why metadata is missing or partial: the card's failed fetches. Only
   * present when the render asked for them (RenderOptions.cardFailures).
   */
  failures?: FetchFailure[]
}

export interface LinkCardProvider {
  name: string
  match: (url: URL) => Pick<ParsedCard, 'kind' | 'info'> | null
  fetchMeta?: (
    parsed: ParsedCard,
    context: RenderContext,
  ) => Promise<CardMeta | null>
}
