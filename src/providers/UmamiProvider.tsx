import { createContext, useContext, useEffect, useState } from 'react'

const UmamiAnalyticsContext = createContext<{
  isLoaded: boolean
  hasError: boolean
}>({
  isLoaded: false,
  hasError: false,
})

export const useUmamiAnalyticsContext = () => useContext(UmamiAnalyticsContext)

export const UmamiProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError] = useState(false)

  useEffect(() => {
    // Check if window.umami is already available (SSR-injected script)
    const checkUmami = () => {
      if (
        typeof window !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).umami
      ) {
        setIsLoaded(true)
        return true
      }
      return false
    }

    if (checkUmami()) return

    // Poll briefly for the async script to load
    const interval = setInterval(() => {
      if (checkUmami()) {
        clearInterval(interval)
      }
    }, 100)

    // Give up after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <UmamiAnalyticsContext.Provider value={{ isLoaded, hasError }}>
      {children}
    </UmamiAnalyticsContext.Provider>
  )
}
