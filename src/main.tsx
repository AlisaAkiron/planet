import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import { AppRouter } from './route.tsx'

import './styles/index.css'
import { UmamiProvider } from './providers/UmamiProvider.tsx'

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UmamiProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </UmamiProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>,
)
