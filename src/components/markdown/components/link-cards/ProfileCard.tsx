import { cardLink } from './CardShell'
import { CalendarIcon, LinkIcon, LocationIcon, OrganizationIcon } from './icons'
import type { ReactNode } from 'react'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export interface ProfileStat {
  label: string
  value: string
}

/**
 * Stat entries from well-known extra keys. Zero-valued stats are noise
 * (e.g. orgs always have 0 following), so they're dropped.
 */
export const statsFromExtra = (
  extra: Record<string, string> | undefined,
  labels: string[],
): ProfileStat[] =>
  labels.flatMap(label => {
    const value = extra?.[label]
    return value !== undefined && value !== '0' ? [{ label, value }] : []
  })

export interface ProfileDetail {
  icon: ReactNode
  text: string
}

/** Detail rows from the well-known extra keys a profile fetcher may set. */
export const detailsFromExtra = (
  extra: Record<string, string> | undefined,
): ProfileDetail[] => {
  const details: ProfileDetail[] = []
  if (extra?.location) {
    details.push({
      icon: <LocationIcon className="h-3.5 w-3.5" />,
      text: extra.location,
    })
  }
  if (extra?.company) {
    details.push({
      icon: <OrganizationIcon className="h-3.5 w-3.5" />,
      text: extra.company,
    })
  }
  if (extra?.website) {
    details.push({
      icon: <LinkIcon className="h-3.5 w-3.5" />,
      text: extra.website.replace(/^https?:\/\//, ''),
    })
  }
  if (extra?.joined) {
    details.push({
      icon: <CalendarIcon className="h-3.5 w-3.5" />,
      text: `Joined ${extra.joined}`,
    })
  }
  return details
}

/**
 * Compact user/org card: centered on the page and internally — avatar on
 * top, then name, handle, bio, detail rows and stat counts.
 */
export const ProfileCard = ({
  card,
  icon,
  handle,
  stats = [],
  details = [],
}: {
  card: CardPayload
  icon: ReactNode
  handle: string
  stats?: ProfileStat[]
  details?: ProfileDetail[]
}) => {
  const { url, meta } = card
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardLink} profile-card relative mx-auto block w-full max-w-sm p-6 text-center`}
    >
      <span className="absolute top-4 right-4 opacity-40">{icon}</span>
      {meta?.image ? (
        <img
          src={meta.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="mx-auto h-16 w-16 rounded-full"
        />
      ) : (
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-base-300">
          {icon}
        </span>
      )}
      <p className="mt-3 truncate text-base font-semibold">
        {meta?.title ?? handle}
      </p>
      <p className="truncate text-sm opacity-60">{handle}</p>
      {meta?.description && (
        <p className="mt-2 line-clamp-2 text-sm opacity-80">
          {meta.description}
        </p>
      )}
      {details.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {details.map(detail => (
            <span
              key={detail.text}
              className="flex max-w-full items-center gap-1 text-xs opacity-60"
            >
              <span className="shrink-0">{detail.icon}</span>
              <span className="truncate">{detail.text}</span>
            </span>
          ))}
        </div>
      )}
      {stats.length > 0 && (
        <div className="mt-4 flex justify-center gap-4">
          {stats.map(stat => (
            <span key={stat.label} className="text-sm">
              <span className="font-semibold">{stat.value}</span>{' '}
              <span className="opacity-60">{stat.label}</span>
            </span>
          ))}
        </div>
      )}
    </a>
  )
}
