import {
  estimateTypewriterDuration,
  PopupTransition,
  Typewriter,
} from '@/components/animation'
import { SocialLink } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const heading = [
  {
    type: 'h1',
    text: "Hi, I'm ",
    class: 'font-light text-4xl',
  },
  {
    type: 'h1',
    text: 'Alisa',
    class: 'font-medium mx-2 text-4xl',
  },
  {
    type: 'h1',
    text: '👋。',
    class: 'font-light text-4xl',
  },
]
const description = [
  {
    type: 'span',
    text: 'Fullstack Developer',
    class: 'text-lg',
  },
  {
    type: 'span',
    text: 'Kigurumi Enthusiast',
    class: 'text-lg',
  },
]

export type SocialMedia = {
  url: string
  icon: string
  color: string
  tooltip: string
  invert: boolean
}

const headingAnimationDuration = estimateTypewriterDuration(heading)
const descriptionAnimationDuration = estimateTypewriterDuration(description)

type HomePageProps = {
  socialMedia: SocialMedia[]
}

export const HomePage = ({ socialMedia }: HomePageProps) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div
        className={cn(
          'flex items-center justify-center',
          'flex-col-reverse lg:flex-row',
          'max-w-[80rem] w-full h-full',
        )}
      >
        {/* Content Section */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center">
          <div className="text-center lg:text-left">
            <Typewriter
              template={heading}
              className="leading-4 [&_*]:inline-block"
            />
            <Typewriter
              template={description}
              className="my-6"
              initialDelay={headingAnimationDuration}
            />
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-4 lg:mt-16 lg:justify-start">
              {socialMedia.map((platform, index) => {
                return (
                  <PopupTransition
                    key={index}
                    initialDelay={
                      headingAnimationDuration +
                      descriptionAnimationDuration +
                      index * 0.2
                    }
                  >
                    <li key={index}>
                      <SocialLink {...platform} />
                    </li>
                  </PopupTransition>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="lg:w-1/2 flex items-center justify-center">
          <img
            alt="Avatar"
            src="/avatar.webp"
            className="h-60 w-60 rounded-full lg:h-72 lg:w-72"
          />
        </div>
      </div>
    </div>
  )
}
