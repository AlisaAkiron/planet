import { CardRow } from './CardShell'
import { ProfileCard } from './ProfileCard'
import { VideoCard } from './VideoCard'
import { YouTubeIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const YouTubeCard = ({ card }: { card: CardPayload }) => {
  const { kind, info, meta, url } = card

  if (kind === 'video') return <VideoCard card={card} />

  const handle = info.handle ?? `channel/${info.channel}`

  if (kind === 'profile' && meta?.title) {
    return (
      <ProfileCard
        card={card}
        icon={<YouTubeIcon className="h-6 w-6" />}
        handle={handle}
      />
    )
  }

  return (
    <CardRow
      href={url}
      icon={<YouTubeIcon className="h-7 w-7" />}
      title={handle}
      subtitle="View channel on YouTube"
    />
  )
}
