'use client'

import { FC } from 'react'
import Image from 'next/image'

import {
  estimateTypewriterDuration,
  PopupTransition,
  Typewriter,
  TypewriterTemplate,
} from '@/components/animation'
import { HeroContainer, HeroContent } from '@/components/layout'
import { SocialLink } from '@/components/ui/button'
import cfg from '@/config'
import { FCC } from '@/types'

const headingTemplate = cfg.home.intro.heading as TypewriterTemplate[]
const descriptionTemplate = cfg.home.intro.description as TypewriterTemplate[]
const socialMedia = cfg.home.intro.socialMedia

const headingAnimationDuration = estimateTypewriterDuration(headingTemplate)
const descriptionAnimationDuration =
  estimateTypewriterDuration(descriptionTemplate)

const Home: FC = () => {
  return (
    <HeroContainer>
      <HeroContent className="flex-col-reverse lg:flex-row">
        <HomeSide>
          <div className="relative text-center leading-4 lg:text-left [&_*]:inline-block">
            <Typewriter template={headingTemplate} />
          </div>
          <div className="my-6 text-center lg:text-left">
            <Typewriter
              template={descriptionTemplate}
              initialDelay={headingAnimationDuration}
            />
          </div>
          <ul className="mx-[60px] mt-4 flex flex-wrap items-center justify-center gap-4 lg:mx-auto lg:mt-16 lg:justify-start">
            {socialMedia.map((media, index) => {
              return (
                <li key={media.url}>
                  <PopupTransition
                    initialDelay={
                      headingAnimationDuration +
                      descriptionAnimationDuration +
                      index * 0.2
                    }
                  >
                    <SocialLink
                      {...media}
                      buttonClassName="w-[35px] h-[35px]"
                      svgClassName="w-[21px] h-[21px]"
                    />
                  </PopupTransition>
                </li>
              )
            })}
          </ul>
        </HomeSide>
        <HomeSide>
          <Image
            src="/avatar.webp"
            width="300"
            height="300"
            alt="Avatar"
            className="h-60 w-60 rounded-full lg:h-72 lg:w-72"
            priority
          />
        </HomeSide>
      </HeroContent>
    </HeroContainer>
  )
}

export default Home

const HomeSide: FCC = ({ children }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center lg:h-auto lg:w-1/2">
      <div className="relative max-w-full lg:max-w-2xl">{children}</div>
    </div>
  )
}
