import { useState } from 'react'
import { BilibiliIcon, PlayIcon, YouTubeIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'
import type { ComponentType } from 'react'

interface VideoProviderConfig {
  icon: ComponentType<{ className?: string }>
  embedUrl: (info: Record<string, string>) => string
  /** Provider-derived preview when meta carries no image. */
  thumbnail?: (info: Record<string, string>) => string
}

const VIDEO_PROVIDERS: Record<string, VideoProviderConfig> = {
  youtube: {
    icon: YouTubeIcon,
    embedUrl: info =>
      `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1${info.start ? `&start=${info.start}` : ''}`,
    thumbnail: info => `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`,
  },
  bilibili: {
    icon: BilibiliIcon,
    embedUrl: info =>
      `https://player.bilibili.com/player.html?bvid=${info.id}&autoplay=1&high_quality=1`,
  },
}

/** Click-to-play facade: no third-party iframe until the user opts in. */
export const VideoCard = ({ card }: { card: CardPayload }) => {
  const { provider, info, meta, url } = card
  const [playing, setPlaying] = useState(false)
  const config = VIDEO_PROVIDERS[provider] ?? VIDEO_PROVIDERS.bilibili
  const ProviderIcon = config.icon
  const title = meta?.title ?? url
  const thumbnail = meta?.image ?? config.thumbnail?.(info)

  if (playing) {
    return (
      <div className="video-card not-prose my-6 aspect-video overflow-hidden rounded-xl bg-black">
        {/* allow-scripts + allow-same-origin is safe for cross-origin
            embeds (the players require both); the sandbox still blocks
            top-navigation, forms and downloads. */}
        {/* eslint-disable react/iframe-missing-sandbox */}
        <iframe
          src={config.embedUrl(info)}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen
        />
        {/* eslint-enable react/iframe-missing-sandbox */}
      </div>
    )
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="video-card not-prose group relative my-6 block aspect-video w-full overflow-hidden rounded-xl bg-base-300 text-left"
      aria-label={`Play video: ${title}`}
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 transition-transform group-hover:scale-110">
          <PlayIcon className="h-8 w-8 pl-1 text-white" />
        </span>
      </span>
      <span className="absolute right-0 bottom-0 left-0 flex items-center gap-2 p-4 text-white">
        <ProviderIcon className="h-5 w-5 shrink-0" />
        <span className="truncate text-sm font-medium">{title}</span>
        {meta?.extra?.author && (
          <span className="shrink-0 text-xs opacity-70">
            {meta.extra.author}
          </span>
        )}
      </span>
    </button>
  )
}
