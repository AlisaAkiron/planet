import { Metadata } from 'next'

export type ElementTemplate = {
  type: string
  text: string
  class: string
}

export type SocialMedia = {
  icon: string
  url: string
  color: string
  tooltip?: string
}

export type Home = {
  intro: {
    heading: ElementTemplate[]
    description: ElementTemplate[]
    socialMedia: SocialMedia[]
  }
}
