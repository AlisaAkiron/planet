import type { Metadata } from 'next'

export type ElementTemplate = {
  type: string
  text?: string
  class?: string
}

export type SocialMedia = {
  hover?: string
  icon: string
  url: string
  theme: string
  buttonLabel?: string
  linkLabel?: string
}

export type Image = {
  src: string
  alt: string
}

export type Images = {
  avatar: Image
}

export type URL = {
  name: string
  url: string
  newTab: boolean
}

export type PlanetConfig = {
  meta: Metadata
  images: Images
  home: {
    intro: {
      heading: ElementTemplate[]
      description: ElementTemplate[]
      social: SocialMedia[]
    }
  }
  footer: {
    moeTravel: boolean
    copyright: {
      startYear: number
      holder: URL
    }
    icp?: URL
    links: URL[]
  }
}
