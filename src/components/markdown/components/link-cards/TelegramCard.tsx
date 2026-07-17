import { CardRow } from './CardShell'
import { ContentCard } from './ContentCard'
import { TelegramIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const TelegramCard = ({ card }: { card: CardPayload }) => {
  const { kind, info, meta, url } = card

  if (meta?.title) {
    return (
      <ContentCard
        card={card}
        icon={<TelegramIcon className="h-5 w-5" />}
        title={meta.title}
        subtitle={`@${info.channel}`}
        footer={
          kind === 'post' ? `Post #${info.id} · Telegram` : 'Telegram channel'
        }
      />
    )
  }

  return (
    <CardRow
      href={url}
      icon={<TelegramIcon className="h-7 w-7" />}
      title={`@${info.channel}`}
      subtitle={
        kind === 'post' ? `Post #${info.id} on Telegram` : 'Telegram channel'
      }
    />
  )
}
