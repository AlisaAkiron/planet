import { useEffect } from 'react'
import { useLocation, useSearch, useSearchParams } from 'wouter'
import { useUmamiAnalyticsContext } from '@/lib/UmamiAnalytic'

export const useCleanUTM = () => {
  const { isLoaded, hasError } = useUmamiAnalyticsContext()
  const [location, navigate] = useLocation()
  const search = useSearch()
  const [, setSearchParams] = useSearchParams()

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run this when location changes
  useEffect(() => {
    if (!isLoaded || hasError) return

    if (search.includes('utm_')) {
      const keysToDelete = []
      const params = new URLSearchParams(search)

      for (const key of params.keys()) {
        if (key.startsWith('utm_')) {
          keysToDelete.push(key)
        }
      }

      if (keysToDelete.length > 0) {
        keysToDelete.forEach(key => {
          params.delete(key)
        })

        // Prevent the ? character from showing up when there are no other params
        if (params.size === 0) {
          navigate(location, { replace: true })
          return
        }

        setSearchParams(params, { replace: true })
      }
    }
  }, [location, isLoaded, hasError])
}
