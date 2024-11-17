import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

import cfg from '@/config'

import '@/styles/index.css'

export const metadata: Metadata = cfg.meta
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
