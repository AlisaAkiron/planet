import { cn } from '@/utils/cn'

type SocialLinkProps = {
  url: string
  icon: string
  color: string
  tooltip: string
  invert: boolean
}

export const SocialLink = ({
  url,
  icon,
  color,
  tooltip,
  invert,
}: SocialLinkProps) => {
  return (
    <div className="tooltip rounded-full size-[36px]">
      <div className="tooltip-content">
        <p>{tooltip}</p>
      </div>
      <button
        className={cn(
          'rounded-full w-full h-full flex items-center justify-center',
          'transform duration-300 ease-in-out hover:-translate-y-1 hover:scale-110',
        )}
        style={{ backgroundColor: color }}
      >
        <a href={url} target="_blank" rel="noreferrer">
          <img
            className={cn('size-[21px]', invert && 'invert')}
            width={24}
            height={24}
            src={`/icons/${icon}.svg`}
            alt={icon}
            style={{ color }}
          />
        </a>
      </button>
    </div>
  )
}
