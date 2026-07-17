import { BilibiliCard } from './BilibiliCard'
import { GenericCard } from './GenericCard'
import { GitHubCard } from './GitHubCard'
import { GitLabCard } from './GitLabCard'
import { TelegramCard } from './TelegramCard'
import { XCard } from './XCard'
import { YouTubeCard } from './YouTubeCard'
import type { CardPayload } from '@/lib/markdown/link-cards/types'
import type { ComponentType } from 'react'

export type CardComponent = ComponentType<{ card: CardPayload }>

const cardComponents: Record<string, CardComponent> = {
  bilibili: BilibiliCard,
  github: GitHubCard,
  gitlab: GitLabCard,
  telegram: TelegramCard,
  x: XCard,
  youtube: YouTubeCard,
}

export const LinkCard = ({ card }: { card?: string }) => {
  if (!card) return null
  let payload: CardPayload
  try {
    payload = JSON.parse(card) as CardPayload
  } catch {
    return null
  }
  const Card = cardComponents[payload.provider] ?? GenericCard
  return <Card card={payload} />
}
