import { FC } from 'react'
import Link from 'next/link'

import { HeroContainer, HeroContent } from '@/components/layout'

const NotFoundPage: FC = () => {
  return (
    <HeroContainer>
      <HeroContent className="flex flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">404</h1>
        <Link href="/" role="button" className="btn btn-accent btn-lg">
          回到首页
        </Link>
      </HeroContent>
    </HeroContainer>
  )
}

export default NotFoundPage
