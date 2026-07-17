import { cn } from '@/utils/cn'
import { cardLink } from './CardShell'
import { PlayIcon } from './icons'
import type { ReactNode } from 'react'
import type {
  CardMediaItem,
  CardPayload,
} from '@/lib/markdown/link-cards/types'

const MAX_GALLERY_ITEMS = 4

/** "2 photos, 1 video" — for footers. */
export const mediaLabel = (media: CardMediaItem[] | undefined) => {
  if (!media || media.length === 0) return undefined
  const photos = media.filter(item => item.type === 'photo').length
  const videos = media.length - photos
  const parts: string[] = []
  if (photos > 0) parts.push(`${photos} photo${photos > 1 ? 's' : ''}`)
  if (videos > 0) parts.push(`${videos} video${videos > 1 ? 's' : ''}`)
  return parts.join(', ')
}

const Gallery = ({ media }: { media: CardMediaItem[] }) => {
  const shown = media.slice(0, MAX_GALLERY_ITEMS)
  const hidden = media.length - shown.length
  return (
    <div
      className={cn(
        'mt-3 grid gap-1 overflow-hidden rounded-lg',
        shown.length > 1 && 'grid-cols-2',
      )}
    >
      {shown.map((item, index) => (
        <span key={item.url} className="relative block">
          <img
            src={item.thumbnail ?? item.url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className={cn(
              'w-full object-cover',
              shown.length === 1 ? 'max-h-80' : 'aspect-video h-full',
            )}
          />
          {item.type === 'video' && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60">
                <PlayIcon className="h-5 w-5 pl-0.5 text-white" />
              </span>
            </span>
          )}
          {hidden > 0 && index === shown.length - 1 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
              +{hidden}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

/**
 * Post/embed-style card (tweets, Telegram posts, channel bios): avatar +
 * author header, body text, media gallery, footer. Centered like the
 * profile card.
 */
export const ContentCard = ({
  card,
  icon,
  title,
  subtitle,
  footer,
}: {
  card: CardPayload
  icon: ReactNode
  title: string
  subtitle?: string
  footer?: string
}) => {
  const { url, meta } = card
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardLink} content-card mx-auto block w-full max-w-lg p-5`}
    >
      <div className="flex items-center gap-3">
        {meta?.image ? (
          <img
            src={meta.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-300">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{title}</p>
          {subtitle && (
            <p className="truncate text-sm opacity-60">{subtitle}</p>
          )}
        </div>
        {meta?.image && <span className="shrink-0 opacity-40">{icon}</span>}
      </div>
      {meta?.description && (
        <p className="mt-3 line-clamp-4 text-sm whitespace-pre-line opacity-90">
          {meta.description}
        </p>
      )}
      {meta?.media && meta.media.length > 0 && <Gallery media={meta.media} />}
      {footer && <p className="mt-3 text-xs opacity-50">{footer}</p>}
    </a>
  )
}
