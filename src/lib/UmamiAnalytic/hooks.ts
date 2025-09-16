/** biome-ignore-all lint/suspicious/noExplicitAny: Umami inject window.umami and need window as any to check */

import { useCallback, useMemo } from 'react'
import type { PageviewData, UTMFetcher } from './types'

export const useUmami = () => {
  const track = useCallback(
    (eventName: string, eventData?: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).umami) {
        ;(window as any).umami.track(eventName, eventData)
      }
    },
    [],
  )

  const trackPageview = useCallback((pageviewData?: PageviewData) => {
    if (typeof window !== 'undefined' && (window as any).umami) {
      if (typeof (window as any).umami.track === 'function') {
        if (pageviewData && Object.keys(pageviewData).length > 0) {
          // For pageviews with custom data, call track with the data
          const data = {
            url:
              pageviewData.url ||
              window.location.pathname + window.location.search,
            title: pageviewData.title || document.title,
            referrer: pageviewData.referrer || document.referrer,
            ...pageviewData,
          }
          ;(window as any).umami.track(data)
        } else {
          // For default pageviews, call track without arguments (defaults to current page)
          ;(window as any).umami.track()
        }
      }
    }
  }, [])

  const trackPageviewAsync = useCallback(
    async (
      utmId: string,
      utmFetcher: UTMFetcher,
      additionalData?: Partial<PageviewData>,
    ) => {
      try {
        const utmData = await utmFetcher(utmId)
        const pageviewData: PageviewData = {
          url: window.location.pathname + window.location.search,
          title: document.title,
          referrer: document.referrer,
          utm_id: utmId,
          ...utmData,
          ...additionalData,
        }

        trackPageview(pageviewData)
      } catch (error) {
        console.error('[Umami Analytics] Error fetching UTM data:', error)
        // Fallback to basic pageview tracking
        trackPageview({
          utm_id: utmId,
          ...additionalData,
        })
      }
    },
    [trackPageview],
  )

  const trackPageviewWithUTM = useCallback(
    (
      utmParams: Partial<PageviewData>,
      additionalData?: Partial<PageviewData>,
    ) => {
      const pageviewData: PageviewData = {
        url: window.location.pathname + window.location.search,
        title: document.title,
        referrer: document.referrer,
        ...utmParams,
        ...additionalData,
      }

      trackPageview(pageviewData)
    },
    [trackPageview],
  )

  return useMemo(
    () => ({
      track,
      trackPageview,
      trackPageviewAsync,
      trackPageviewWithUTM,
    }),
    [track, trackPageview, trackPageviewAsync, trackPageviewWithUTM],
  )
}
