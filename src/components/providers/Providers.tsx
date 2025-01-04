import { ThemeProvider } from 'next-themes'

import { FCC } from '@/types'

import { SWRProvider } from './swr-provider'

export const Providers: FCC = ({ children }) => {
  return (
    <>
      <SWRProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SWRProvider>
    </>
  )
}
