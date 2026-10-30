import { bilibili } from './bilibili.ts'
import { github } from './github.ts'
import { gitlab } from './gitlab.ts'
import { telegram } from './telegram.ts'
import { x } from './x.ts'
import { youtube } from './youtube.ts'
import type { CardMeta, LinkCardProvider, ParsedCard } from './types.ts'
import type { RenderContext } from '../context.ts'
import type { FetchFailure } from '../fetch.ts'

const providers: LinkCardProvider[] = [
  github,
  gitlab,
  x,
  youtube,
  bilibili,
  telegram,
]

export const matchLinkCard = (rawUrl: string): ParsedCard | null => {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  for (const provider of providers) {
    const matched = provider.match(url)
    if (matched) return { provider: provider.name, url: rawUrl, ...matched }
  }
  return null
}

/**
 * The card's metadata, or null when its provider has none for it or it
 * failed — fetch failures reach the context's listeners; a provider that
 * throws (an unexpected response shape) is reported as `invalid`.
 */
export const resolveCardMeta = async (
  parsed: ParsedCard,
  context: RenderContext,
  onFailure?: (failure: FetchFailure) => void,
): Promise<CardMeta | null> => {
  const provider = providers.find(p => p.name === parsed.provider)
  if (!provider?.fetchMeta) return null
  try {
    return await provider.fetchMeta(parsed, context)
  } catch {
    onFailure?.({ url: parsed.url, reason: 'invalid' })
    return null
  }
}

export type { CardPayload } from './types.ts'
