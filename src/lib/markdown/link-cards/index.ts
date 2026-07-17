import { bilibili } from './bilibili.ts'
import { github } from './github.ts'
import { gitlab } from './gitlab.ts'
import { telegram } from './telegram.ts'
import { x } from './x.ts'
import { youtube } from './youtube.ts'
import type { CardMeta, LinkCardProvider, ParsedCard } from './types.ts'

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

export const resolveCardMeta = async (
  parsed: ParsedCard,
): Promise<CardMeta | null> => {
  const provider = providers.find(p => p.name === parsed.provider)
  if (!provider?.fetchMeta) return null
  try {
    return await provider.fetchMeta(parsed)
  } catch {
    return null
  }
}

export type { CardPayload } from './types.ts'
