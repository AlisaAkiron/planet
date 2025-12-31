import {
  estimateTypewriterDuration,
  PopupTransition,
  Typewriter,
} from '@/components/animation'
import { SocialLink } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { DefaultLayout } from '../layout/DefaultLayout'

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

const socialMedia = [
  {
    url: 'https://space.bilibili.com/5627849',
    icon: 'bilibili',
    color: '#00A1D6',
    tooltip: '@Alisa_Akiron',
    invert: true,
  },
  {
    url: 'https://github.com/AlisaAkiron',
    icon: 'github',
    color: '#181818',
    tooltip: '@AlisaAkiron',
    invert: true,
  },
  {
    url: 'mailto:alisa@alisaqaq.moe',
    icon: 'envelope',
    color: '#D44638',
    tooltip: 'alisa@alisaqaq.moe',
    invert: true,
  },
  {
    url: 'https://git.alisaqaq.moe',
    icon: 'gitlab',
    color: '#FC6D26',
    tooltip: 'Alisa Lab Codebin',
    invert: true,
  },
  {
    url: 'https://x.com/alisaqaq',
    icon: 'x',
    color: '#000000',
    tooltip: '@alisaqaq',
    invert: false,
  },
  {
    url: 'https://qm.qq.com/q/2VkT7DtVc4',
    icon: 'qq',
    color: '#12B7F5',
    tooltip: 'QQ',
    invert: false,
  },
]

const headingAnimationDuration = estimateTypewriterDuration(heading)
const descriptionAnimationDuration = estimateTypewriterDuration(description)

export const HomePage = () => {
  return (
    <DefaultLayout className="flex items-center justify-center">
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
    </DefaultLayout>
  )
}
