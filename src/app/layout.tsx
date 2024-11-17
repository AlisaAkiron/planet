import type { Metadata } from 'next'

import cfg from '@/config'

import '@/styles/index.css'

import { PublicEnvScript } from 'next-runtime-env'

import { Providers } from '@/components/providers'
import { FCC } from '@/types'

export const metadata: Metadata = cfg.meta

const RootLayout: FCC = ({ children }) => {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <PublicEnvScript />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
