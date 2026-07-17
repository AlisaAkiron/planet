import { CardRow } from './CardShell'
import { ProfileCard, statsFromExtra } from './ProfileCard'
import { VideoCard } from './VideoCard'
import { BilibiliIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const BilibiliCard = ({ card }: { card: CardPayload }) => {
  const { kind, info, meta, url } = card

  if (kind === 'video') return <VideoCard card={card} />

  if (kind === 'profile' && meta?.title) {
    return (
      <ProfileCard
        card={card}
        icon={<BilibiliIcon className="h-6 w-6" />}
        handle={`UID ${info.uid}`}
        stats={statsFromExtra(meta.extra, ['followers', 'following', 'videos'])}
      />
    )
  }

  return (
    <CardRow
      href={url}
      icon={<BilibiliIcon className="h-7 w-7" />}
      title={`UID ${info.uid}`}
      subtitle="View profile on Bilibili"
    />
  )
}
