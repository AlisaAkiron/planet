import { isProduction } from '@/lib/env'

import { PlanetConfig } from './types'

const config: PlanetConfig = {
  meta: {
    metadataBase: new URL('https://alisaqaq.moe'),
    title: '迷いの森',
    description: 'Slient Space',
    keywords: ['Alisa', 'blog'],
    robots: {
      index: isProduction,
      follow: isProduction,
      googleBot: {
        index: isProduction,
        follow: isProduction,
      },
    },
  },
}

export default config
