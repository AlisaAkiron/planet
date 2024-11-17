'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'

import { FCC } from '@/types'

export const ThemeProvider: FCC = ({ children }) => {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemeProvider>
  )
}
