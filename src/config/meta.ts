import { Metadata } from 'next'

import { isProduction } from '@/lib/env'

const meta: Metadata = {
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
}

export default meta
