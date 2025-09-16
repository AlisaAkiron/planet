import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createUmamiConfig } from './helper'
import type { UmamiAnalyticsProps } from './types'

const UmamiAnalyticsContext = createContext<{
  isLoaded: boolean
  hasError: boolean
  setIsLoaded: (loaded: boolean) => void
  setHasError: (error: boolean) => void
}>({
  isLoaded: false,
  hasError: false,
  setIsLoaded: () => {},
  setHasError: () => {},
})

export const useUmamiAnalyticsContext = () => useContext(UmamiAnalyticsContext)

export const UmamiAnalyticsProvider = ({
  children,
  config,
}: {
  children: React.ReactNode
  config: UmamiAnalyticsProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <UmamiAnalyticsContext.Provider
      value={{
        isLoaded,
        setIsLoaded,
        hasError,
        setHasError,
      }}
    >
      <UmamiAnalytics {...config} />
      {children}
    </UmamiAnalyticsContext.Provider>
  )
}

const UmamiAnalytics = memo((props: UmamiAnalyticsProps) => {
  const { setIsLoaded, setHasError } = useUmamiAnalyticsContext()
  const isLoadedRef = useRef(false)
  const config = createUmamiConfig(props)

  const validateConfig = useCallback((): boolean => {
    if (!config.url || config.url.trim() === '') {
      return false
    }
    if (!config.websiteId || config.websiteId.trim() === '') {
      return false
    }
    return true
  }, [config.url, config.websiteId])

  const checkScriptAlreadyLoaded = useCallback((): boolean => {
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; i++) {
      if (
        scripts[i].getAttribute('src') === `${config.url}/script.js` &&
        scripts[i].getAttribute('data-website-id') === config.websiteId
      ) {
        return true
      }
    }
    return false
  }, [config.url, config.websiteId])

  const loadScript = useCallback(() => {
    if (isLoadedRef.current) {
      return
    }

    if (checkScriptAlreadyLoaded()) {
      isLoadedRef.current = true
      setIsLoaded(true)
      return
    }

    if (!validateConfig()) {
      setHasError(true)
      return
    }

    const script = document.createElement('script')
    script.src = `${config.url}/script.js`
    script.defer = true
    script.async = true
    script.setAttribute('data-website-id', config.websiteId)

    // Add custom domains if provided
    if (config.domains && config.domains.length > 0) {
      script.setAttribute('data-domains', config.domains.join(','))
    }

    // Add custom attributes if provided
    if (config.scriptAttributes) {
      Object.entries(config.scriptAttributes).forEach(([key, value]) => {
        script.setAttribute(key, value)
      })
    }

    // Add load and error event listeners
    script.onload = () => {
      console.log('[Umami Analytics] Script loaded successfully')
      setIsLoaded(true)
    }

    script.onerror = () => {
      console.error('[Umami Analytics] Failed to load script')
      setHasError(true)
    }

    document.head.appendChild(script)
    isLoadedRef.current = true
  }, [
    config.url,
    config.websiteId,
    config.domains,
    config.scriptAttributes,
    validateConfig,
    setHasError,
    setIsLoaded,
    checkScriptAlreadyLoaded,
  ])

  useEffect(() => {
    if (!validateConfig()) {
      return
    }

    loadScript()
  }, [validateConfig, loadScript])

  return null
})
