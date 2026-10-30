import { useEffect, useRef } from 'react'
import { initRybbit } from '@/lib/rybbit/client'

export const RybbitProvider = ({ children }: { children: React.ReactNode }) => {
  const initialized = useRef(false)

  useEffect(() => {
    // Guard against React StrictMode double-invoke and re-renders.
    if (initialized.current) return
    initialized.current = true

    void initRybbit()
  }, [])

  return <>{children}</>
}
