import { cardLink } from './CardShell'
import { ForkIcon, IssueIcon, PullRequestIcon, StarIcon } from './icons'
import type { ReactNode } from 'react'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

const LanguageBar = ({ card }: { card: CardPayload }) => {
  const languages = card.meta?.languages
  if (!languages || languages.length === 0) return null
  return (
    <div className="mt-3">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-base-300">
        {languages.map(lang => (
          <span
            key={lang.name}
            style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {languages.map(lang => (
          <span
            key={lang.name}
            className="flex items-center gap-1.5 text-xs opacity-70"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            {lang.name}
            <span className="opacity-70">{lang.percent}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Repository card: description, star/fork/issue/PR counts, language bar. */
export const RepoCard = ({
  card,
  icon,
  fallbackTitle,
}: {
  card: CardPayload
  icon: ReactNode
  fallbackTitle: string
}) => {
  const { url, meta } = card
  const stats = [
    { icon: <StarIcon />, value: meta?.extra?.stars, label: 'stars' },
    { icon: <ForkIcon />, value: meta?.extra?.forks, label: 'forks' },
    { icon: <IssueIcon />, value: meta?.extra?.issues, label: 'issues' },
    { icon: <PullRequestIcon />, value: meta?.extra?.prs, label: 'PRs' },
  ].filter(stat => stat.value !== undefined)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardLink} repo-card block p-5`}
    >
      <div className="flex items-center gap-3">
        {meta?.image && (
          <img
            src={meta.image}
            alt=""
            loading="lazy"
            className="h-8 w-8 shrink-0 rounded-md"
          />
        )}
        <p className="min-w-0 flex-1 truncate font-semibold">
          {meta?.title ?? fallbackTitle}
        </p>
        <span className="shrink-0 opacity-50">{icon}</span>
      </div>
      {meta?.description && (
        <p className="mt-2 line-clamp-2 text-sm opacity-70">
          {meta.description}
        </p>
      )}
      {stats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {stats.map(stat => (
            <span
              key={stat.label}
              className="flex items-center gap-1 text-sm opacity-70"
            >
              {stat.icon}
              <span className="font-medium">{stat.value}</span>
              <span className="opacity-70">{stat.label}</span>
            </span>
          ))}
        </div>
      )}
      <LanguageBar card={card} />
    </a>
  )
}
