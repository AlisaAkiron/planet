import type { Metadata } from 'next'

import cfg from '@/config'

import '@/styles/index.css'

import { FC } from 'react'
import { PublicEnvScript } from 'next-runtime-env'

import { Providers } from '@/components/providers'
import { Footer } from '@/components/shared/footer'
import { FCC } from '@/types'

export const metadata: Metadata = cfg.meta

const RootLayout: FCC = ({ children }) => {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <WebsiteIcons />
        <PublicEnvScript />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

const WebsiteIcons: FC = () => {
  return (
    <>
      <link
        rel="icon"
        type="image/png"
        href="/favicon-16x16.png"
        sizes="16x16"
      />
      <link
        rel="icon"
        type="image/png"
        href="/favicon-32x32.png"
        sizes="32x32"
      />
      <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
    </>
  )
}

export default RootLayout
