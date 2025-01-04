import { FC } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

type SocialLinkProps = {
  url: string
  icon: string
  color: string
  buttonClassName?: string
  imageClassName?: string
}

export const SocialLink: FC<SocialLinkProps> = ({
  url,
  icon,
  color,
  buttonClassName = 'size-[35px]',
  imageClassName = 'size-[21px]',
}) => {
  return (
    <>
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-full border-0',
          buttonClassName,
        )}
        style={{ backgroundColor: color }}
      >
        <a href={url} target="_blank">
          <Image
            className={cn('invert filter', imageClassName)}
            src={`/icons/${icon}.svg`}
            width={24}
            height={24}
            alt={`Icon for ${icon}`}
          />
        </a>
      </button>
    </>
  )
}
