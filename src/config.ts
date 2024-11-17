import { PlanetConfig } from './types'

const config: PlanetConfig = {
  meta: {
    metadataBase: new URL('https://alisaqaq.moe'),
    title: '迷いの森',
    description: 'Slient Space',
    keywords: ['Alisa', 'blog'],
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  },
}

export default config
