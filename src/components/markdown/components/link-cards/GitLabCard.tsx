import { CardRow } from './CardShell'
import { FileCard } from './FileCard'
import { ProfileCard } from './ProfileCard'
import { RepoCard } from './RepoCard'
import { StateBadge } from './StateBadge'
import { GitLabIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const GitLabCard = ({ card }: { card: CardPayload }) => {
  const { kind, info, meta, url } = card

  if (kind === 'profile') {
    return (
      <ProfileCard
        card={card}
        icon={<GitLabIcon className="h-6 w-6" />}
        handle={`@${info.path}`}
      />
    )
  }

  if (kind === 'project') {
    return (
      <RepoCard
        card={card}
        icon={<GitLabIcon className="h-6 w-6" />}
        fallbackTitle={info.path}
      />
    )
  }

  if (kind === 'file') {
    return (
      <FileCard
        card={card}
        icon={<GitLabIcon className="h-5 w-5" />}
        project={info.path}
        file={info.file}
      />
    )
  }

  // mr / issue: compact row
  const label =
    kind === 'mr' ? `Merge request !${info.number}` : `Issue #${info.number}`
  return (
    <CardRow
      href={url}
      icon={<GitLabIcon className="h-8 w-8" />}
      title={meta?.title ?? label}
      subtitle={`${info.path} · ${label}`}
      badge={
        meta?.extra?.state && (
          <StateBadge state={meta.extra.state} kind={kind} />
        )
      }
    />
  )
}
