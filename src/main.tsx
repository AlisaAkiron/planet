import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './route.tsx'

import './styles/index.css'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>,
)
