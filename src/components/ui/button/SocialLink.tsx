import { FC } from 'react'
import * as Fa6Icons from 'react-icons/fa6'

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
  // @ts-ignore
  const Icon = Fa6Icons[icon]
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
            <Icon className="h-6 w-6" color="white" />
          </a>
        </button>
      </div>
    </>
  )
}
