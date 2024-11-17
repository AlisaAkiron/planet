import { ThemeProvider } from 'next-themes'

import { FCC } from '@/types'

export const Providers: FCC = ({ children }) => {
  return (
    <>
      <ThemeProvider>{children}</ThemeProvider>
    </>
  )
}
