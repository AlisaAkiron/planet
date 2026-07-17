import { CardRow } from './CardShell'
import { FileCard } from './FileCard'
import { ProfileCard, detailsFromExtra, statsFromExtra } from './ProfileCard'
import { RepoCard } from './RepoCard'
import { StateBadge } from './StateBadge'
import { GitHubIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const GitHubCard = ({ card }: { card: CardPayload }) => {
  const { kind, info, meta, url } = card
  const repoPath = `${info.owner}/${info.repo}`

  if (kind === 'profile') {
    return (
      <ProfileCard
        card={card}
        icon={<GitHubIcon className="h-6 w-6" />}
        handle={`@${info.owner}`}
        stats={statsFromExtra(meta?.extra, ['followers', 'following', 'repos'])}
        details={detailsFromExtra(meta?.extra)}
      />
    )
  }

  if (kind === 'repo') {
    return (
      <RepoCard
        card={card}
        icon={<GitHubIcon className="h-6 w-6" />}
        fallbackTitle={repoPath}
      />
    )
  }

  if (kind === 'file') {
    return (
      <FileCard
        card={card}
        icon={<GitHubIcon className="h-5 w-5" />}
        project={repoPath}
        file={info.path}
      />
    )
  }

  // pull / issue: compact row
  return (
    <CardRow
      href={url}
      icon={<GitHubIcon className="h-8 w-8" />}
      title={meta?.title ?? `#${info.number}`}
      subtitle={`${repoPath} · ${kind === 'pull' ? 'Pull request' : 'Issue'} #${info.number}`}
      badge={
        meta?.extra?.state && (
          <StateBadge state={meta.extra.state} kind={kind} />
        )
      }
    />
  )
}
