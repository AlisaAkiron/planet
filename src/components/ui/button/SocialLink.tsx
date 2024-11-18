import { FC } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

type SocialLinkProps = {
  url: string
  icon: string
  color: string
  tooltip?: string
  buttonClassName?: string
  svgClassName?: string
}

export const SocialLink: FC<SocialLinkProps> = ({
  url,
  icon,
  color,
  tooltip,
  buttonClassName = 'w-10 h-10',
  svgClassName = 'w-6 h-6',
}) => {
  const hasTooltip = tooltip !== undefined && tooltip != ''

  return (
    <>
      <div
        className={hasTooltip ? 'tooltip tooltip-bottom tooltip-accent' : ''}
        data-tip={tooltip}
      >
        <button
          className={cn(
            'flex items-center justify-center rounded-full border-0',
            buttonClassName,
          )}
          style={{ backgroundColor: color }}
        >
          <a href={url} target="_blank">
            <Image
              className={cn('invert filter', svgClassName)}
              src={`/icons/${icon}.svg`}
              width={24}
              height={24}
              alt={`Icon for ${icon}`}
            />
          </a>
        </button>
      </div>
    </>
  )
}
