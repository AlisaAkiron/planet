import { CardRow } from './CardShell'
import { ContentCard, mediaLabel } from './ContentCard'
import { ProfileCard, detailsFromExtra, statsFromExtra } from './ProfileCard'
import { XIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const XCard = ({ card }: { card: CardPayload }) => {
  const { kind, info, meta, url } = card

  if (kind === 'profile' && meta?.title) {
    return (
      <ProfileCard
        card={card}
        icon={<XIcon className="h-6 w-6" />}
        handle={`@${info.handle}`}
        stats={statsFromExtra(meta.extra, ['followers', 'following', 'posts'])}
        details={detailsFromExtra(meta.extra)}
      />
    )
  }

  if (kind === 'post' && meta?.description) {
    const handle = meta.extra?.handle ?? info.handle
    const footerParts = [meta.extra?.date, mediaLabel(meta.media), 'X'].filter(
      Boolean,
    )
    return (
      <ContentCard
        card={card}
        icon={<XIcon className="h-5 w-5" />}
        title={meta.title ?? `@${handle}`}
        subtitle={`@${handle}`}
        footer={footerParts.join(' · ')}
      />
    )
  }

  return (
    <CardRow
      href={url}
      icon={<XIcon className="h-7 w-7" />}
      title={`@${info.handle}`}
      subtitle={kind === 'post' ? 'View post on X' : 'View profile on X'}
    />
  )
}
