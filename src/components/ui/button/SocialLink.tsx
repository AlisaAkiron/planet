import { FC } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

type SocialLinkProps = {
  url: string
  icon: string
  color: string
  tooltip?: string
}

export const SocialLink: FC<SocialLinkProps> = ({
  url,
  icon,
  color,
  tooltip,
}) => {
  const hasTooltip = tooltip !== undefined && tooltip != ''

  return (
    <>
      <div
        className={hasTooltip ? 'tooltip tooltip-top' : ''}
        data-tip={tooltip}
      >
        <button
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-0',
          )}
          style={{ backgroundColor: color }}
        >
          <a href={url} target="_blank">
            <Image
              className="h-6 w-6 invert filter"
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
